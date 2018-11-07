import PixelMatrix, { Point, Pixel } from './PixelMatrix'
import HiMarkov, { StateTransition } from './HiMarkov'
import Shape from './Shape'
import Deque from 'double-ended-queue'
import arrayShuffle from 'array-shuffle'

export type initialize =
  'initializeInCenter' |
  'initializeRandomly'

export type expand =
  'expandPoints' |
  'expandPointsInRandomBlobs' |
  'expandPointsInRandomWalk'

type PixelToPixelTransition = StateTransition<Pixel, Pixel>
const trainNoOp = (progress: number) => { }
const generateNoOp = (progress: number, pixelMatrixInProgress: PixelMatrix) => { }

const pixelCodec = {
  encode(pixel: Pixel) {
    return pixel.red + ',' + pixel.green + ',' + pixel.blue + ',' + pixel.alpha
  },
  decode(encodedPixel: string): Pixel {
    const [red, green, blue, alpha] = encodedPixel.split(',').map(s => parseInt(s, 10))
    return { red, green, blue, alpha }
  }
}

export const pixelStateTransitionCodec = {
  from: pixelCodec,
  to: pixelCodec
}

export const train = (trainingData: PixelMatrix, onProgress = trainNoOp) => {
  const markovChain = new HiMarkov(pixelStateTransitionCodec)

  const numberOfMooreNeighbors = 8
  // This slightly overestimates the number of state transitions since pixels on the
  // edge of the matrix don't actually have 8 Moore neighbors
  let totalStateTransitions = trainingData.countPixels * numberOfMooreNeighbors
  let stateTransitionsRecorded = 0
  trainingData.forEach((pixel: Pixel, point: Point) => {
    trainingData.getMooreNeighboringPixels(point).forEach(neighbor => {
      const stateTransition: StateTransition<Pixel, Pixel> = [pixel, neighbor]
      markovChain.recordStateTransition(stateTransition)
      stateTransitionsRecorded++
      onProgress(stateTransitionsRecorded / totalStateTransitions)
    })
  })

  return markovChain
}

export default class MarkovImageGenerator {
  trainingData: PixelMatrix
  markovChain: HiMarkov<Pixel, Pixel> | undefined
  constructor(trainingData: PixelMatrix, markovChain?: HiMarkov<Pixel, Pixel>) {
    this.trainingData = trainingData
    this.markovChain = markovChain
  }
  train(onProgress = trainNoOp) {
    this.markovChain = train(this.trainingData, onProgress)
  }
  getPixelsGenerator(outputShape: Shape, rate = 10, initializationAlgorithm: initialize = 'initializeInCenter', expansionAlgorithm: expand = 'expandPointsInRandomWalk'): () => { progress: number, pixels: PixelMatrix } {
    if (!this.markovChain) {
      throw new Error(`Can't generate pixels without a markov chain. Make sure you called MarkovImageGenerator#train before trying to generate pixels.`)
    }

    const [outputWidth, outputHeight] = outputShape
    const markovPixels = new PixelMatrix(outputWidth, outputHeight)

    const pointsToExpandFrom = new Deque<Point>(markovPixels.countPixels)

    this[initializationAlgorithm](markovPixels, pointsToExpandFrom)

    let pixelsGenerated = 0

    const generatePixels = () => {
      if (pointsToExpandFrom.length > 0) {
        const pointsExpanded = this[expansionAlgorithm](rate, pointsToExpandFrom, markovPixels)
        pixelsGenerated += pointsExpanded
      }

      const progress = pixelsGenerated / markovPixels.countPixels
      return {
        progress,
        pixels: markovPixels
      }
    }

    return generatePixels
  }
  private initializeInCenter(markovPixels: PixelMatrix, pointsToExpandFrom: Deque<Point>) {
    const startingPoint = markovPixels.getCenter()
    const startingColor = this.trainingData.getRandomPixel()
    markovPixels.set(startingPoint, startingColor)
    pointsToExpandFrom.push(startingPoint)
  }
  private initializeRandomly(markovPixels: PixelMatrix, pointsToExpandFrom: Deque<Point>) {
    const randomlyInitializeMarkovPixel = () => {
      const startingPoint = markovPixels.getRandomPoint()
      const startingColor = this.trainingData.getRandomPixel()
      markovPixels.set(startingPoint, startingColor)
      pointsToExpandFrom.push(startingPoint)
    }

    for (let i = 0; i < 3; i++) {
      randomlyInitializeMarkovPixel()
    }
  }

  private expandPointsInRandomBlobs(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = arrayShuffle(neighbors)

      shuffledNeighbors.forEach((neighbor: Point) => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

        const neighborColor = this.markovChain!.predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighbor, neighborColor)
        if (Math.random() > 0.5) {
          pointsToExpandFrom.unshift(neighbor)
        } else {
          // pointsToExpandFrom.push(neighbor)
        }
      })
    }

    let pointsExpanded = 0
    for (let i = 0; i < expansionRate; i++) {
      const point = pointsToExpandFrom.pop()!
      if (!point) break
      expand(point)
      pointsExpanded++
    }

    return pointsExpanded
  }
  private expandPointsInRandomWalk(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = arrayShuffle(neighbors)

      shuffledNeighbors.forEach((neighbor: Point) => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

        const neighborColor = this.markovChain!.predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighbor, neighborColor)
        if (Math.random() > 0.5) {
          pointsToExpandFrom.unshift(neighbor)
        } else {
          pointsToExpandFrom.push(neighbor)
        }
      })
    }

    let pointsExpanded = 0
    for (let i = 0; i < expansionRate; i++) {
      const point = pointsToExpandFrom.pop()!
      if (!point) break
      expand(point)
      pointsExpanded++
    }

    return pointsExpanded
  }
  private expandPoints(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = arrayShuffle(neighbors)

      shuffledNeighbors.forEach((neighbor: Point) => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

        const neighborColor = this.markovChain!.predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighbor, neighborColor)
        pointsToExpandFrom.push(neighbor)
      })
    }

    let pointsExpanded = 0
    for (let i = 0; i < expansionRate; i++) {
      const point = pointsToExpandFrom.pop()!
      if (!point) break
      expand(point)
      pointsExpanded++
    }

    return pointsExpanded
  }
}