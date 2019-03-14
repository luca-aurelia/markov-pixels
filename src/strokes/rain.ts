import PixelMatrix, { Pixel, Point } from '../PixelMatrix'
import Deque from 'double-ended-queue'
import isColored from './isColored'
import { Paint } from '../paints/types'

export default (paint: Paint) => (markovPixels: PixelMatrix, points: Deque<Point>) => {
  const getNewPoint = (point: Point) => {
    // Move down this column one pixel
    let neighbor = { x: point.x, y: point.y + 1 }
    // If we've reached the bottom of this column, move to the top of the next column
    if (!markovPixels.contains(neighbor)) neighbor = { x: point.x + 1, y: 0 }

    // If we've reached the last pixel, return
    if (!markovPixels.contains(neighbor)) return

    let neighboringPixel = markovPixels.get(neighbor)

    // if neighbor is already colored, don't change color
    if (isColored(neighboringPixel)) return

    return neighbor
  }

  const newPoints = new Deque<Point>(points.length)
  while (!points.isEmpty()) {
    const point = points.pop()!
    const newPoint = getNewPoint(point)

    if (!newPoint) continue

    paint(markovPixels, point, newPoint)
    newPoints.push(newPoint)
  }

  return newPoints
}