import PixelMatrix, { Point, Pixel } from '../PixelMatrix'

export interface PointInitializer {
  (markovPixels: PixelMatrix): Point[]
}

export interface ColorInitializer {
  (): Pixel
}