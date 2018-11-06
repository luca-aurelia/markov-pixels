import BrowserPixelMatrix, { Point } from './BrowserPixelMatrix'

export default class ToroidalBrowserPixelMatrix extends BrowserPixelMatrix {
  static fromPixelMatrix(pixelMatrix) {
    return new ToroidalBrowserPixelMatrix(pixelMatrix.width, pixelMatrix.height, pixelMatrix.colorProfile, pixelMatrix.pixels)
  }
  static async load(imagePath: string): Promise<ToroidalBrowserPixelMatrix> {
    const pixelMatrix = await BrowserPixelMatrix.load(imagePath)
    return ToroidalBrowserPixelMatrix.fromPixelMatrix(pixelMatrix)
  }
  contains(point: Point): boolean {
    return true
  }
  getIndex(point: Point): number {
    let { x, y } = point
    x = x % this.width
    y = y % this.height
    return super.getIndex({ x, y })
  }
}