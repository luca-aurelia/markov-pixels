import { Pixel, Point } from '../PixelMatrix'
import Shape from '../Shape'

export default ([width, height]: Shape) => {
  const center = { x: width / 2, y: height / 2 }
  const getNormalizedDiamondDistanceFromCenter = (pixel: Pixel, point: Point) => {
    let x = point.x - center.x
    let y = point.y - center.y
    if (x < 0) x *= -1
    if (y < 0) y *= -1
    return (x + y) / (center.x + center.y)
  }

  return (pixel: Pixel, point: Point) => {
    const distance = getNormalizedDiamondDistanceFromCenter(pixel, point)
    return (distance * 10) % 1
  }
}