import PixelMatrix from './PixelMatrix'
import { loadImage, createCanvas, NodeCanvas } from 'canvas'
import saveStreamToFile from './saveStreamToFile'

export * from './PixelMatrix'

export default class BrowserPixelMatrix extends PixelMatrix {
  static fromPixelMatrix(pixelMatrix: PixelMatrix): BrowserPixelMatrix {
    return new BrowserPixelMatrix(pixelMatrix.width, pixelMatrix.height, pixelMatrix.colorProfile, pixelMatrix.pixels)
  }
  static async load(imagePath: string): Promise<PixelMatrix> {
    const image = await loadImage(imagePath)
    const canvas = createCanvas(image.width, image.height)
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0)
    return PixelMatrix.fromCanvas(canvas)
  }
  toCanvas(): NodeCanvas {
    const canvas = createCanvas(this.width, this.height)
    this.putPixels(canvas)
    return canvas
  }
  toImageData(): ImageData {
    return new ImageData(this.pixels, this.width, this.height)
  }
  async saveAsPNG(outputPath: string): Promise<void> {
    const pixelStream = this.toCanvas().createPNGStream()
    await saveStreamToFile(pixelStream, outputPath)
  }
}
