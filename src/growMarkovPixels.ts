import PixelMatrix, { Point, Pixel } from './PixelMatrix'
import HiMarkov, { StateTransition } from './HiMarkov'
import * as Deque from 'double-ended-queue'
import Shape from './types/Shape'

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

  const markovPixels = new PixelMatrix(outputWidth, outputHeight)

  const points = new Deque<Point>(trainingData.countPixels)
  const randomlyInitializeMarkovPixel = () => {
    const startingPoint = markovPixels.getRandomPoint()
    const startingColor = trainingData.getRandomPixel()
    markovPixels.set(startingPoint, startingColor)
    points.push(startingPoint)
  }

  for (let i = 0; i < 3; i++) {
    randomlyInitializeMarkovPixel()
  }

  let pixelsGenerated = 0
  console.log('Generating image.')
  while (points.length > 0) {
    const point = points.pop()!
    const color = markovPixels.get(point)
    const neighbors = markovPixels.getMooreNeighboringPoints(point)
    neighbors.forEach(neighbor => {
      const neighboringPixel = markovPixels.get(neighbor)
      // if neighbor is already colored, don't change color
      if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

      const neighborColor = chain.predict(color)
      markovPixels.set(neighbor, neighborColor)
      points.unshift(neighbor)
      pixelsGenerated++
      const progress = pixelsGenerated / markovPixels.countPixels
      onProgress(progress)
    })
  }

  return markovPixels
}

export default growMarkovPixels