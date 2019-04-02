import { Pixel } from '../PixelMatrix'
import comparePixels, { PixelToNumber } from './comparePixels'
import pixelCodec from '../pixelCodec'

interface NumberCache {
  [encodedPixel: string]: number
}

export default (mapper: PixelToNumber) => {
  const cache: NumberCache = {}

  const cachedMapper = (pixel: Pixel) => {
    const key = pixelCodec.encode(pixel)

    if (cache[key] == null) {
      const value = mapper(pixel)
      cache[key] = value
    }

    return cache[key]
  }

  return comparePixels(cachedMapper)
}