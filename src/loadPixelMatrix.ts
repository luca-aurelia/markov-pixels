import PixelMatrix from './PixelMatrix'
import { loadImage, createCanvas } from 'canvas'

const loadPixelMatrix = async (imagePath: string): Promise<PixelMatrix> => {
  const image = await loadImage(imagePath)
  const canvas = createCanvas(image.width, image.height)
  const context = canvas.getContext('2d')!
  context.drawImage(image, 0, 0)
  return PixelMatrix.fromCanvas(canvas)
}

export default loadPixelMatrix