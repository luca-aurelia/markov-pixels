import PixelMatrix, { Point, Pixel } from './PixelMatrix'
import HiMarkov, { StateTransition, StateSorter, SerializedTransitionsByFromState } from './HiMarkov'
import Shape from './Shape'
import Deque from 'double-ended-queue'
import arrayShuffle from 'array-shuffle'
import localForage from 'localforage'

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
  'expandPointsInRandomOverwritableWalk' |
  'expandPointsFromTop'

export const expansionAlgorithms: expand[] = [
  'expandPoints',
  'expandPointsInRandomBlobs',
  'expandPointsInRandomWalk',
  'expandPointsInRandomOverwritableWalk',
  'expandPointsFromTop'
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

const twoFiveSixSquared = 256 * 256
const numberCodec = {
  encode({ red, green, blue, alpha }: Pixel) {
    return red + (green * 256) + (blue * twoFiveSixSquared)
  },
  decode(n: number) {
    return {
      red: Math.round(n % 256),
      green: Math.round((n / 256) % 256),
      blue: Math.round(n / (twoFiveSixSquared)),
      alpha: 255
    }
  }
}

export const stringCodecs = {
  from: pixelCodec,
  to: pixelCodec
}

export const numberCodecs = {
  from: numberCodec,
  to: numberCodec
}

const pixelSorterNoOp = (a: Pixel, b: Pixel): -1 | 0 | 1 => 0

export const train = async (trainingDataKey: string, trainingData: PixelMatrix, onProgress = trainNoOp, pixelSorter = pixelSorterNoOp) => {
  // let serializedTrainingData = await localForage.getItem(trainingDataKey) as SerializedTransitionsByFromState<Pixel>
  // if (serializedTrainingData != null) {
  //   console.log('loading from serialized')
  //   return HiMarkov.fromSerialized(pixelStateTransitionCodec, serializedTrainingData, pixelSorter)
  // }

  // const markovChain = new GraphMarkov(numberCodecs, pixelSorter, trainingDataSize)
  const markovChain = new HiMarkov(stringCodecs, [], pixelSorter)
  const trainingDataSize = trainingData.width * trainingData.height
  const numberOfMooreNeighbors = 8
  // This slightly overestimates the number of state transitions since pixels on the
  // edge of the matrix don't actually have 8 Moore neighbors
  let totalStateTransitions = trainingData.countPixels * numberOfMooreNeighbors
  let stateTransitionsRecorded = 0
  console.log('recording state transitions  ')
  trainingData.forEach((pixel: Pixel, point: Point) => {
    trainingData.getMooreNeighboringPixels(point).forEach(neighbor => {
      const stateTransition: StateTransition<Pixel, Pixel> = [pixel, neighbor]
      markovChain.recordStateTransition(stateTransition)
      stateTransitionsRecorded++
      onProgress(stateTransitionsRecorded / totalStateTransitions)
    })
  })

  // console.log('state transitions recorded. caching state transitions.')
  // localForage.setItem(trainingDataKey, markovChain.serializeStateTransitions())

  return markovChain
}

const isEmptyPixel = ({ red, green, blue, alpha }: Pixel) => red === 0 && green === 0 && blue === 0 && alpha === 0

export default class MarkovImageGenerator {
  trainingData: PixelMatrix
  markovChain: HiMarkov<Pixel, Pixel> | undefined
  // markovChain: GraphMarkov<Pixel, Pixel> | undefined
  src: string
  constructor(src: string, trainingData: PixelMatrix, markovChain?: HiMarkov<Pixel, Pixel>) {
    this.src = src
    this.trainingData = trainingData
    this.markovChain = markovChain
  }
  async train(onProgress = trainNoOp, pixelSorter = pixelSorterNoOp) {
    this.markovChain = await train(this.src, this.trainingData, onProgress, pixelSorter)
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
  private expandPointsFromTop(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix, getInferenceParameter?: getInferenceParameter) {
    const expand = (point: Point) => {
      let neighbor = { x: point.x, y: point.y + 1 }
      // If we've reached the bottom of this column, move to the next column
      if (!markovPixels.contains(neighbor)) neighbor = { x: point.x + 1, y: 0 }
      // If we've reached the last pixel, return
      if (!markovPixels.contains(neighbor)) return

      let neighboringPixel = markovPixels.get(neighbor)
      // if neighbor is already colored, don't change color
      if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

      let inferenceParameter
      if (getInferenceParameter) inferenceParameter = getInferenceParameter(neighboringPixel, neighbor)

      const color = markovPixels.get(point)
      const neighborColor = this.markovChain!.predict(color, inferenceParameter)
      if (!neighborColor) throw new Error(`Prediction failed`)
      markovPixels.set(neighbor, neighborColor)
      pointsToExpandFrom.push(neighbor)
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