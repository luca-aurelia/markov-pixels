import PixelMatrix from './PixelMatrix'
import { loadImage } from 'canvas'

export * from './PixelMatrix'

export default class BrowserPixelMatrix extends PixelMatrix {
  static fromPixelMatrix(pixelMatrix: PixelMatrix): BrowserPixelMatrix {
    return new BrowserPixelMatrix(pixelMatrix.width, pixelMatrix.height, pixelMatrix.colorProfile, pixelMatrix.pixels)
  }
  static async load(imagePath: string): Promise<PixelMatrix> {
    const image = await loadImage(imagePath)
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0)
    return PixelMatrix.fromCanvas(canvas)
  }
  toCanvas() {
    const canvas = new HTMLCanvasElement()
    canvas.width = this.width
    canvas.height = this.height
    this.putPixels(canvas)
    return canvas
  }
  toImageData(): ImageData {
    return new ImageData(this.pixels, this.width, this.height)
  }
}
