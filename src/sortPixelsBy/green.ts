import { Pixel } from '../PixelMatrix'
import comparePixels from './comparePixels'

export default comparePixels((pixel: Pixel) => pixel.green)