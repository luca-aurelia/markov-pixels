import { Pixel, Point } from '../PixelMatrix'
import BrowserPixelMatrix from '../BrowserPixelMatrix'
import getBrightness from '../getBrightness'
import Shape from '../Shape'

const normalizedBrightness = (pixel: Pixel) => getBrightness(pixel) / 765

export default async ([width, height]: Shape, src: string) => {
  const center = { x: width / 2, y: height / 2 }

  const otherImage = await BrowserPixelMatrix.load(src)
  const otherImageCenter = otherImage.getCenter()
  const getVectorFromCenter = (point: Point) => {
    return {
      x: point.x - center.x,
      y: point.y - center.y
    }
  }

  return (pixel: Pixel, point: Point) => {
    const distanceFromCenter = getVectorFromCenter(point)
    const otherImagePoint = {
      x: otherImageCenter.x + distanceFromCenter.x,
      y: otherImageCenter.y + distanceFromCenter.y
    }
    const otherImagePixel = otherImage.get(otherImagePoint)
    return normalizedBrightness(otherImagePixel) * 0.8 + 0.1
  }
}