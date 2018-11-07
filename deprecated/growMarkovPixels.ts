import PixelMatrix, { Point, Pixel } from './PixelMatrix'
import HiMarkov, { StateTransition } from './HiMarkov'
import Shape from './Shape'
import * as Deque from 'double-ended-queue'

type PixelToPixelTransition = StateTransition<Pixel, Pixel>
interface onProgressFunction {
  (progress: number): void
}

const noOp = (progress: number) => { }

const growMarkovPixels = (trainingData: PixelMatrix, outputShape: Shape, onProgress = noOp) => {
  const [inputWidth, inputHeight] = trainingData.shape
  const [outputWidth, outputHeight] = outputShape

  const stateTransitions: PixelToPixelTransition[] = []

  trainingData.forEach((pixel: Pixel, point: Point) => {
    trainingData.getMooreNeighboringPixels(point).forEach(neighbor => {
      stateTransitions.push([pixel, neighbor])
    })
  })

  console.log('Training.')
  const chain = new HiMarkov(stateTransitions)
  return generate
}

export default growMarkovPixels