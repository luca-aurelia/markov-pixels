import { Pixel, Point } from '../PixelMatrix'
import Shape from '../Shape'

const getDistance = (a: Point, b: Point) => {
  const x = (a.x - b.x) ** 2
  const y = (a.y - b.y) ** 2
  return Math.sqrt(x + y)
}

export default ([width, height]: Shape) => {
  const center = { x: width / 2, y: height / 2 }
  const maxDistanceFromCenter = getDistance(center, { x: width, y: height })
  const getNormalizedDistanceFromCenter = (pixel: Pixel, point: Point) => {
    const x = (center.x - point.x) ** 2
    const y = (center.y - point.y) ** 2
    const distance = Math.sqrt(x + y)
    return distance / maxDistanceFromCenter
  }

  return (pixel: Pixel, point: Point) => {
    const distance = getNormalizedDistanceFromCenter(pixel, point)
    return (Math.sqrt(distance) * 10) % 1
  }
}