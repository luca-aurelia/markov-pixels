import PixelMatrix, { Pixel, Point } from '../PixelMatrix'
import isColored from '../util/isColored'
import { Paint } from '../paints/types'
import toCartesian from '../util/toCartesian'
import Deque from 'double-ended-queue'

const phi = (1 + Math.sqrt(5)) / 2
const piHalfs = Math.PI / 2
const cotB = Math.log(phi) / piHalfs

const randomWalk = (value: number, stepSize: number) => {
  if (Math.random() < 0.5) {
    return value + Math.random() * stepSize
  } else {
    return value - Math.random() * stepSize
  }
}

export default (paint: Paint, rate: number, source: Point) => {
  // Starting value for angle.
  let phase = 0
  let dPhase = 2 * Math.PI * 0.01
  // Angle.
  let t = 0
  // 100 iterations per 360 degrees.
  const dt = 2 * Math.PI * 0.001

  let previous = source
  return (markovPixels: PixelMatrix, points: Deque<Point>) => {
    const getPoint = (angle: number) => {
      const radius = Math.E ** (cotB * angle)
      const cartesian = toCartesian({ radius, angle: angle + phase })
      // Snap the Cartesian point to the closest point on the grid of pixels.
      const pointOnGrid = {
        x: source.x + Math.round(cartesian.x),
        y: source.y + Math.round(cartesian.y)
      }
      return pointOnGrid
    }

    for (let pointIndex = 0; pointIndex < rate; pointIndex++) {
      // t = randomWalk(t, dt)
      t += dt
      phase = randomWalk(phase, dPhase)
      let pointToPaint = getPoint(t)
      // If we've reached the edge of the image, change the phase and start over.
      if (!markovPixels.contains(pointToPaint)) {
        // phase = randomWalk(phase, dPhase)
        t = 0
        pointToPaint = getPoint(t)
        if (pointToPaint.x > 3000) debugger
      }
      paint(markovPixels, previous!, pointToPaint)
      previous = pointToPaint
    }

    return points
  }
}