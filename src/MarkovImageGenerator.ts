import PixelMatrix, { Point, Pixel } from './PixelMatrix'
import HiMarkov, { StateTransition, StateSorter } from './HiMarkov'
import Shape from './Shape'
import Deque from 'double-ended-queue'
import arrayShuffle from 'array-shuffle'
import { SortResults } from 'sorted';

export type initialize =
  'initializeInCenter' |
  'initializeRandomly' |
  'initializeInTopLeft' |
  'initializeInTopRight' |
  'initializeInBottomRight' |
  'initializeInBottomLeft'

export const initializationAlgorithms: initialize[] = [
  'initializeInCenter',
  'initializeRandomly',
  'initializeInTopLeft',
  'initializeInTopRight',
  'initializeInBottomRight',
  'initializeInBottomLeft'
]

export type expand =
  'expandPoints' |
  'expandPointsInRandomBlobs' |
  'expandPointsInRandomWalk' |
  'expandPointsInRandomOverwritableWalk'

export const expansionAlgorithms: expand[] = [
  'expandPoints',
  'expandPointsInRandomBlobs',
  'expandPointsInRandomWalk',
  'expandPointsInRandomOverwritableWalk'
]

type PixelToPixelTransition = StateTransition<Pixel, Pixel>
type PixelsGenerator = (inferenceParameter?: number) => { progress: number, pixels: PixelMatrix }
type getInferenceParameter = (pixel: Pixel, point: Point) => number
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

const pixelSorterNoOp = (a: Pixel, b: Pixel): SortResults => 0

export const train = (trainingData: PixelMatrix, onProgress = trainNoOp, pixelSorter = pixelSorterNoOp) => {
  const markovChain = new HiMarkov(pixelStateTransitionCodec, [], pixelSorter)

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

const isEmptyPixel = ({ red, green, blue, alpha }: Pixel) => red === 0 && green === 0 && blue === 0 && alpha === 0

export default class MarkovImageGenerator {
  trainingData: PixelMatrix
  markovChain: HiMarkov<Pixel, Pixel> | undefined
  constructor(trainingData: PixelMatrix, markovChain?: HiMarkov<Pixel, Pixel>) {
    this.trainingData = trainingData
    this.markovChain = markovChain
  }
  train(onProgress = trainNoOp, pixelSorter = pixelSorterNoOp) {
    this.markovChain = train(this.trainingData, onProgress, pixelSorter)
  }
  getPixelsGenerator(outputShape: Shape, rate = 10, initializationAlgorithm: initialize = 'initializeInCenter', expansionAlgorithm: expand = 'expandPointsInRandomWalk', getInferenceParameter?: getInferenceParameter): PixelsGenerator {
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
        const pointsExpanded = this[expansionAlgorithm](rate, pointsToExpandFrom, markovPixels, getInferenceParameter)
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
  private initializeInTopLeft(markovPixels: PixelMatrix, pointsToExpandFrom: Deque<Point>) {
    const startingPoint = { x: 0, y: 0 }
    const startingColor = this.trainingData.getRandomPixel()
    markovPixels.set(startingPoint, startingColor)
    pointsToExpandFrom.push(startingPoint)
  }
  private initializeInTopRight(markovPixels: PixelMatrix, pointsToExpandFrom: Deque<Point>) {
    const startingPoint = { x: markovPixels.width - 1, y: 0 }
    const startingColor = this.trainingData.getRandomPixel()
    markovPixels.set(startingPoint, startingColor)
    pointsToExpandFrom.push(startingPoint)
  }
  private initializeInBottomRight(markovPixels: PixelMatrix, pointsToExpandFrom: Deque<Point>) {
    const startingPoint = { x: markovPixels.width - 1, y: markovPixels.height - 1 }
    const startingColor = this.trainingData.getRandomPixel()
    markovPixels.set(startingPoint, startingColor)
    pointsToExpandFrom.push(startingPoint)
  }
  private initializeInBottomLeft(markovPixels: PixelMatrix, pointsToExpandFrom: Deque<Point>) {
    const startingPoint = { x: 0, y: markovPixels.height - 1 }
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

  private expandPointsInRandomBlobs(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix, getInferenceParameter?: getInferenceParameter) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = arrayShuffle(neighbors)

      shuffledNeighbors.forEach((neighbor: Point) => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (!isEmptyPixel(neighboringPixel)) return

        let inferenceParameter
        if (getInferenceParameter) inferenceParameter = getInferenceParameter(neighboringPixel, neighbor)
        const neighborColor = this.markovChain!.predict(color, inferenceParameter)
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
  private expandPointsInRandomWalk(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix, getInferenceParameter?: getInferenceParameter) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = arrayShuffle(neighbors)

      shuffledNeighbors.forEach((neighbor: Point) => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

        let inferenceParameter
        if (getInferenceParameter) inferenceParameter = getInferenceParameter(neighboringPixel, neighbor)

        const neighborColor = this.markovChain!.predict(color, inferenceParameter)
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
  private expandPointsInRandomOverwritableWalk(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix, getInferenceParameter?: getInferenceParameter) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = arrayShuffle(neighbors)

      shuffledNeighbors.forEach((neighbor: Point) => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (!isEmptyPixel(neighboringPixel) && Math.random() > 0.2) return

        let inferenceParameter
        if (getInferenceParameter) inferenceParameter = getInferenceParameter(neighboringPixel, neighbor)

        const neighborColor = this.markovChain!.predict(color, inferenceParameter)
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
  private expandPoints(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix, getInferenceParameter?: getInferenceParameter) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      // const shuffledNeighbors = arrayShuffle(neighbors)

      neighbors.forEach((neighbor: Point) => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

        let inferenceParameter
        if (getInferenceParameter) inferenceParameter = getInferenceParameter(neighboringPixel, neighbor)

        const neighborColor = this.markovChain!.predict(color, inferenceParameter)
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