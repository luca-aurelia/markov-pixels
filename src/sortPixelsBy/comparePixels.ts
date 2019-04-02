import { Pixel } from '../PixelMatrix'

export interface PixelToNumber {
  (pixel: Pixel): number
}

export default (mapper: PixelToNumber) => (a: Pixel, b: Pixel) => {
  const aProp = mapper(a)
  const bProp = mapper(b)

  if (aProp === bProp) return 0
  else if (aProp > bProp) return 1
  else if (aProp < bProp) return -1
  else throw new RangeError('Unstable comparison: ' + a + ' cmp ' + b)
}