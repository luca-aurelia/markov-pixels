import PixelMatrix, { Point } from '../PixelMatrix'
import Deque from 'double-ended-queue'
import arrayShuffle from 'array-shuffle'
import isColored from './isColored'
import { Paint } from '../paints/types'

export default (paint: Paint, expansionRate: number) => (markovPixels: PixelMatrix, points: Deque<Point>) => {
  const expand = (point: Point) => {
    const neighbors = markovPixels.getMooreNeighboringPoints(point)
    const shuffledNeighbors = arrayShuffle(neighbors)

    for (const neighbor of shuffledNeighbors) {
      const neighboringPixel = markovPixels.get(neighbor)
      // if neighbor is already colored, don't change color
      if (isColored(neighboringPixel)) continue

      paint(markovPixels, point, neighbor)
      if (Math.random() > 0.5) {
        points.unshift(neighbor)
      } else {
        points.push(neighbor)
      }
    }
  }

  for (let i = 0; i < expansionRate; i++) {
    const point = points.pop()!
    if (!point) break

    expand(point)
  }

  return points
}