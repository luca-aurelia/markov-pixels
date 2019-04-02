import { Pixel } from '../PixelMatrix'
import cachedComparePixels from './comparePixels'
import colorConvert from 'color-convert'
import getBrightness from '../getBrightness'

export default cachedComparePixels((pixel: Pixel) => {
  const hsl = colorConvert.rgb.hsl(pixel.red, pixel.green, pixel.blue)
  // Normalize saturation to range [0, 1].
  const saturation = hsl[1] / 100
  const brightness = 1 - getBrightness(pixel)
  return (saturation + brightness) / 2
})
