import PixelMatrix, { Point, Pixel } from './PixelMatrix'
import HiMarkov, { StateTransition, StateSorter, SerializedTransitionsByFromState } from './HiMarkov'
import Shape from './Shape'
import Deque from 'double-ended-queue'
import localForage from 'localforage'
import createMarkovPaint, { getInferenceParameter } from './paints/trainMarkovPaint'

type PixelToPixelTransition = StateTransition<Pixel, Pixel>
type PixelsGenerator = (inferenceParameter?: number) => { finished: boolean, pixels: PixelMatrix }
const generateNoOp = (progress: number, pixelMatrixInProgress: PixelMatrix) => { }

export interface PointInitializer {
  (markovPixels: PixelMatrix): Point[]
}

export interface ColorInitializer {
  (trainingData: PixelMatrix): Pixel
}

export interface Stroke {
  (markovPixels: PixelMatrix, points: Deque<Point>): Deque<Point>
}

export default class MarkovImageGenerator {
  trainingData: PixelMatrix
  markovChain: HiMarkov<Pixel, Pixel> | undefined
  // markovChain: GraphMarkov<Pixel, Pixel> | undefined
  src: string
  pointInitializer: PointInitializer
  colorInitializer: ColorInitializer
  stroke: Stroke
  constructor(src: string, trainingData: PixelMatrix, pointInitializer: PointInitializer, colorInitializer: ColorInitializer, stroke: Stroke, markovChain?: HiMarkov<Pixel, Pixel>) {
    this.src = src
    this.trainingData = trainingData
    this.markovChain = markovChain
    this.pointInitializer = pointInitializer
    this.colorInitializer = colorInitializer
    this.stroke = stroke
  }
  getPixelsGenerator(outputShape: Shape): PixelsGenerator {
    const markovPixels = new PixelMatrix(...outputShape)

    let points = this.initialize(markovPixels)
    let pixelsGenerated = 0

    const generatePixels = () => {
      if (points.length > 0) {
        points = this.stroke(markovPixels, points)
        pixelsGenerated += points.length
      }
      const finished = points.length === 0

      return {
        finished,
        pixels: markovPixels
      }
    }

    return generatePixels
  }

  private initialize(markovPixels: PixelMatrix) {
    const pointsToPaint = new Deque<Point>(markovPixels.countPixels)
    const points = this.pointInitializer(markovPixels)
    points.forEach(point => {
      const pixel = this.colorInitializer(this.trainingData)
      markovPixels.set(point, pixel)
      pointsToPaint.push(point)
    })

    return pointsToPaint
  }
}