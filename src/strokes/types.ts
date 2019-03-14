import PixelMatrix, { Point, Pixel } from '../PixelMatrix'
import Deque from 'double-ended-queue'

export interface Stroke {
  (markovPixels: PixelMatrix, points: Deque<Point>): Deque<Point>
}
