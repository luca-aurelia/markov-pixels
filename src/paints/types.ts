import PixelMatrix, { Pixel, Point } from '../PixelMatrix'
import Deque from 'double-ended-queue'
import { getInferenceParameter } from './trainMarkovPaint'

export interface Paint {
  (markovPixels: PixelMatrix, point: Point, neighbor: Point): void
}
