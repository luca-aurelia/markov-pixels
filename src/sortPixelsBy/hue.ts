import { Pixel } from '../PixelMatrix'
import cachedComparePixels from './comparePixels'
import colorConvert from 'color-convert'

export default cachedComparePixels((pixel: Pixel) => {
  const hsl = colorConvert.rgb.hsl(pixel.red, pixel.green, pixel.blue)
  const hue = hsl[0]
  return hue
})
