import PixelMatrix, { Point, Pixel } from './PixelMatrix'
import Shape from './Shape'
import Deque from 'double-ended-queue'
import { Stroke } from './strokes/types'
import { PointInitializer, ColorInitializer } from './initializers/types'

export type PixelsGenerator = (inferenceParameter?: number) => { finished: boolean, pixels: PixelMatrix }

export default (outputShape: Shape, pointInitializer: PointInitializer, colorInitializer: ColorInitializer, stroke: Stroke): PixelsGenerator => {
  const markovPixels = new PixelMatrix(...outputShape)

  let pointsToPaint = new Deque<Point>(markovPixels.countPixels)
  const startingPoints = pointInitializer(markovPixels)
  startingPoints.forEach(point => {
    const pixel = colorInitializer()
    markovPixels.set(point, pixel)
    pointsToPaint.push(point)
  })

  const generatePixels = () => {
    if (pointsToPaint.length > 0) {
      pointsToPaint = stroke(markovPixels, pointsToPaint)
    }

    const finished = pointsToPaint.length === 0

    return {
      finished,
      pixels: markovPixels
    }
  }

  return generatePixels
}