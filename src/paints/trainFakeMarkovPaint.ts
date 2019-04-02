import PixelMatrix, { Pixel, Point } from '../PixelMatrix'
import Deque from 'double-ended-queue'
import sorted, { Sorted } from 'sorted'
import pixelCodec from '../pixelCodec'

export type getInferenceParameter = (pixel: Pixel, point: Point) => number

const pixelSorterNoOp = (a: Pixel, b: Pixel): -1 | 0 | 1 => 0

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

const onTrainingProgressNoOp = (progress: number) => { }
type onProgress = (progress: number) => void
type pixelSorter = (a: Pixel, b: Pixel) => -1 | 0 | 1

interface PointsByColor {
  [encodedColor: string]: Deque<Point>
}

interface MarkovChain {
  predict(pixel: Pixel, inferenceParameter?: number): Pixel
}

interface SortedPixelsByColor {
  [encodedColor: string]: Sorted<Pixel>
}

class FakeMarkovChain {
  pointsByColor: PointsByColor
  trainingData: PixelMatrix
  pixelSorter: pixelSorter
  allNeighborsByColor: SortedPixelsByColor
  constructor(trainingData: PixelMatrix, pixelSorter: pixelSorter, pointsByColor: PointsByColor) {
    this.pointsByColor = pointsByColor
    this.trainingData = trainingData
    this.pixelSorter = pixelSorter
    this.allNeighborsByColor = {}
  }
  getRandomPointWithColor(pixel: Pixel) {
    const points = this.getPointsByColor(pixel)
    const randomIndex = Math.floor(Math.random() * points.length)
    return points.get(randomIndex)!
  }
  getRandomNeighbor(point: Point) {
    const neighboringPixels = this.trainingData.getMooreNeighboringPixels(point)
    const randomIndex = Math.floor(Math.random() * neighboringPixels.length)
    return neighboringPixels[randomIndex]
  }
  getPointsByColor(pixel: Pixel) {
    const key = pixelCodec.encode(pixel)
    // All the points in trainingData that have the given color.
    return this.pointsByColor[key]
  }
  predict(pixel: Pixel, inferenceParameter?: number) {
    if (inferenceParameter == null) {
      const randomPoint = this.getRandomPointWithColor(pixel)
      return this.getRandomNeighbor(randomPoint)
    }

    const key = pixelCodec.encode(pixel)

    if (this.allNeighborsByColor[key] == null) {
      const pointsWithColor = this.getPointsByColor(pixel)
      if (!pointsWithColor) debugger
      const neighboringPixels = sorted<Pixel>([], this.pixelSorter)
      for (let i = 0; i < pointsWithColor.length; i++) {
        const pointWithColor = pointsWithColor.get(i)!
        for (const neighbor of this.trainingData.getMooreNeighboringPixels(pointWithColor)) {
          neighboringPixels.push(neighbor)
        }
      }
      this.allNeighborsByColor[key] = neighboringPixels
    }

    const index = Math.floor(inferenceParameter * this.allNeighborsByColor[key].length)
    return this.allNeighborsByColor[key].get(index)
  }
}

export const train = (trainingData: PixelMatrix, onProgress: onProgress, pixelSorter: pixelSorter) => {
  const pointsByColor: PointsByColor = {}

  let i = 0
  trainingData.forEach((pixel, point) => {
    onProgress(i / trainingData.countPixels)
    const key = pixelCodec.encode(pixel)
    if (!pointsByColor[key]) pointsByColor[key] = new Deque<Point>(50)
    pointsByColor[key].push(point)
    i++
  })

  return new FakeMarkovChain(trainingData, pixelSorter, pointsByColor)
}

const getMarkovPainter = (markovChain: MarkovChain, getInferenceParameter?: getInferenceParameter) => (markovPixels: PixelMatrix, point: Point, neighbor: Point) => {
  const color = markovPixels.get(point)

  let inferenceParameter
  if (getInferenceParameter) inferenceParameter = getInferenceParameter(color, neighbor)

  const prediction = markovChain.predict(color, inferenceParameter)
  if (!prediction) {
    console.warn('Prediction failed')
    return
  }

  markovPixels.set(neighbor, prediction)
}

export default async (trainingData: PixelMatrix, onTrainingProgress = onTrainingProgressNoOp, pixelSorter = pixelSorterNoOp, getInferenceParameter?: getInferenceParameter) => {
  const markovChain = train(trainingData, onTrainingProgress, pixelSorter)
  return getMarkovPainter(markovChain, getInferenceParameter)
}