import MarkovImageGenerator from './MarkovImageGenerator'
import NodePixelMatrix from './NodePixelMatrix'
import Shape from '../types/Shape'

export default class NodeMarkovImageGenerator extends MarkovImageGenerator {
  generatePngStream(outputShape: Shape, onProgress: (progress: number) => void) {
    const markovPixels = this.generatePixels(outputShape, onProgress)
    return NodePixelMatrix.fromPixelMatrix(markovPixels).toCanvas().createPNGStream()
  }
}