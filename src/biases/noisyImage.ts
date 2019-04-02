import { Pixel, Point } from '../PixelMatrix'
import Shape from '../Shape'
import getImageBias from './image'

export default async (outputShape: Shape, src: string) => {
  const imageBias = await getImageBias(outputShape, src)

  return (pixel: Pixel, point: Point) => {
    const b = imageBias(pixel, point)
    return b * 0.9 + (Math.random() * 0.1)
  }
}