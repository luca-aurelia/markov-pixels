import PixelMatrix, { Point, Pixel, mooreOffsets } from './PixelMatrix'
import HiMarkov, { StateTransition } from './HiMarkov'
import arrayShuffle from 'array-shuffle'
import MarkovImageGenerator, { pixelStateTransitionCodec, expand, initialize } from './MarkovImageGenerator'
import Shape from './Shape'
import Deque from 'double-ended-queue'

type directionallyExpand = expand |
  'directionallyExpandPoints' |
  'directionallyExpandPointsInRandomBlobs' |
  'directionallyExpandPointsInRandomWalk'

type directionallyInitialize = initialize

const trainNoOp = (progress: number) => { }

interface NeighboringPointWithOffset {
  offset: Point
  neighboringPoint: Point
}

const getMooreNeighboringPointsWithOffsets = (pixelMatrix: PixelMatrix, point: Point) => {
  const pointsWithOffsets: NeighboringPointWithOffset[] = []
  mooreOffsets.forEach(offset => {
    const neighboringPoint = {
      x: point.x + offset.x,
      y: point.y + offset.y
    }

    if (!pixelMatrix.contains(neighboringPoint)) {
      return
    }

    pointsWithOffsets.push({
      offset,
      neighboringPoint
    })
  })
  if (!pointsWithOffsets.length) {
  }
  return pointsWithOffsets
}

export default class DirectionalMarkovImageGenerator extends MarkovImageGenerator {
  markovChains: HiMarkov<Pixel, Pixel>[][]
  constructor(trainingData: PixelMatrix) {
    super(trainingData)
    this.markovChains = []
  }
  train(onProgress = trainNoOp) {
    // Dummy markov chain so that super class doesn't generate spurious errors
    this.markovChain = new HiMarkov<Pixel, Pixel>(pixelStateTransitionCodec)

    const numberOfMooreNeighbors = 8
    // This slightly overestimates the number of state transitions since pixels on the
    // edge of the matrix don't actually have 8 Moore neighbors
    let totalStateTransitions = this.trainingData.countPixels * numberOfMooreNeighbors
    let stateTransitionsRecorded = 0

    this.trainingData.forEach((pixel: Pixel, point: Point) => {
      if (pixel.alpha === 255 && pixel.blue === 160 && pixel.green === 128 && pixel.red === 123) {
      }
      getMooreNeighboringPointsWithOffsets(this.trainingData, point).forEach(({ neighboringPoint, offset }) => {
        if (pixel.alpha === 255 && pixel.blue === 160 && pixel.green === 128 && pixel.red === 123) {
        }
        const neighboringPixel = this.trainingData.get(neighboringPoint)
        const stateTransition: [Pixel, Pixel] = [pixel, neighboringPixel]

        this.getMarkovChainFor(offset).recordStateTransition(stateTransition)
        stateTransitionsRecorded++
        onProgress(stateTransitionsRecorded / totalStateTransitions)
      })
    })
  }
  getPixelsGenerator(outputShape: Shape, rate = 10, initializationAlgorithm: directionallyInitialize = 'initializeInCenter', expansionAlgorithm: directionallyExpand = 'directionallyExpandPointsInRandomBlobs'): () => { progress: number, pixels: PixelMatrix } {
    return super.getPixelsGenerator(outputShape, rate, initializationAlgorithm, expansionAlgorithm as expand)
  }
  private getMarkovChainFor(offset: Point) {
    if (!this.markovChains[offset.x]) this.markovChains[offset.x] = []
    if (!this.markovChains[offset.x][offset.y]) {
      this.markovChains[offset.x][offset.y] = new HiMarkov(pixelStateTransitionCodec)
    }
    return this.markovChains[offset.x][offset.y]
  }
  private directionallyExpandPointsInRandomBlobs(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = getMooreNeighboringPointsWithOffsets(markovPixels, point)
      const shuffledNeighbors = arrayShuffle(neighbors)

      shuffledNeighbors.forEach(({ neighboringPoint, offset }) => {
        const neighboringPixel = markovPixels.get(neighboringPoint)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

        let neighborColor = this.getMarkovChainFor(offset).predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighboringPoint, neighborColor)
        if (Math.random() > 0.5) {
          pointsToExpandFrom.unshift(neighboringPoint)
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
  private directionallyExpandPointsInRandomWalk(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = getMooreNeighboringPointsWithOffsets(markovPixels, point)
      const shuffledNeighbors = arrayShuffle(neighbors)

      shuffledNeighbors.forEach(({ neighboringPoint, offset }) => {
        const neighboringPixel = markovPixels.get(neighboringPoint)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

        let neighborColor = this.getMarkovChainFor(offset).predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighboringPoint, neighborColor)
        if (Math.random() > 0.5) {
          pointsToExpandFrom.unshift(neighboringPoint)
        } else {
          pointsToExpandFrom.push(neighboringPoint)
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
  private directionallyExpandPoints(expansionRate: number, pointsToExpandFrom: Deque<Point>, markovPixels: PixelMatrix) {
    const expand = (point: Point) => {
      const color = markovPixels.get(point)
      const neighbors = getMooreNeighboringPointsWithOffsets(markovPixels, point)
      // const shuffledNeighbors = arrayShuffle(neighbors)

      neighbors.forEach(({ neighboringPoint, offset }) => {
        const neighboringPixel = markovPixels.get(neighboringPoint)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

        let neighborColor = this.getMarkovChainFor(offset).predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighboringPoint, neighborColor)
        pointsToExpandFrom.unshift(neighboringPoint)
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