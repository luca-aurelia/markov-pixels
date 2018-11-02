import PixelMatrix, { Point, Pixel } from './PixelMatrix'
import HiMarkov, { StateTransition } from './HiMarkov'
import Shape from '../types/Shape'
import Deque from 'double-ended-queue'

type PixelToPixelTransition = StateTransition<Pixel, Pixel>
interface onProgressFunction {
  (progress: number): void
}

const trainNoOp = (progress: number) => { }
const generateNoOp = (progress: number, pixelMatrixInProgress: PixelMatrix) => { }

const pixelCodec = {
  encode(pixel: Pixel) {
    return pixel.red + ',' + pixel.green + ',' + pixel.blue + ',' + pixel.alpha
  },
  decode(encodedPixel: string): Pixel {
    const [red, green, blue, alpha] = encodedPixel.split(',').map(s => parseInt(s, 10))
    return { red, green, blue, alpha }
  }
}

export default class MarkovImageGenerator {
  trainingData: PixelMatrix
  markovChain: HiMarkov<Pixel, Pixel> | undefined
  constructor(trainingData: PixelMatrix, markovChain?: HiMarkov<Pixel, Pixel>) {
    this.trainingData = trainingData
    this.markovChain = markovChain
  }
  train(onProgress = trainNoOp) {
    const stateTransitions: PixelToPixelTransition[] = []

    this.markovChain = new HiMarkov(pixelCodec, pixelCodec, stateTransitions)

    const numberOfMooreNeighbors = 8
    // This slightly overestimates the number of state transitions since pixels on the
    // edge of the matrix don't actually have 8 Moore neighbors
    let totalStateTransitions = this.trainingData.countPixels * numberOfMooreNeighbors
    let stateTransitionsRecorded = 0
    this.trainingData.forEach((pixel: Pixel, point: Point) => {
      this.trainingData.getMooreNeighboringPixels(point).forEach(neighbor => {
        const stateTransition: [Pixel, Pixel] = [pixel, neighbor]
        this.markovChain!.recordStateTransition(stateTransition)
        stateTransitionsRecorded++
        onProgress(stateTransitionsRecorded / totalStateTransitions)
      })
    })
  }
  generatePixels(outputShape: Shape, onProgress = generateNoOp): Promise<PixelMatrix> {
    return new Promise((resolve, reject) => {
      if (!this.markovChain) {
        throw new Error(`Can't generate pixels without a markov chain. Make sure you called MarkovImageGenerator#train before trying to generate pixels.`)
      }

      const [outputWidth, outputHeight] = outputShape
      const markovPixels = new PixelMatrix(outputWidth, outputHeight)

      const pointsToExpandFrom = new Deque<Point>(markovPixels.countPixels)
      const randomlyInitializeMarkovPixel = () => {
        const startingPoint = markovPixels.getRandomPoint()
        const startingColor = this.trainingData.getRandomPixel()
        markovPixels.set(startingPoint, startingColor)
        pointsToExpandFrom.push(startingPoint)
      }

      for (let i = 0; i < 3; i++) {
        randomlyInitializeMarkovPixel()
      }

      let pixelsGenerated = 0
      console.log('Generating image.')
      const iterate = () => {
        if (pointsToExpandFrom.length > 0) {
          window.requestAnimationFrame(iterate)
        } else {
          resolve(markovPixels)
        }
        const pointsToExpand = 5
        for (let i = 0; i < pointsToExpand; i++) {
          const point = pointsToExpandFrom.pop()!
          if (!point) return
          const color = markovPixels.get(point)
          const neighbors = markovPixels.getMooreNeighboringPoints(point)
          neighbors.forEach(neighbor => {
            const neighboringPixel = markovPixels.get(neighbor)
            // console.log({ neighboringPixel })
            // if neighbor is already colored, don't change color
            if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha) return

            const neighborColor = this.markovChain!.predict(color)
            markovPixels.set(neighbor, neighborColor)
            if (Math.random() > 0.5) {
              pointsToExpandFrom.unshift(neighbor)
            } else {
              pointsToExpandFrom.push(neighbor)
            }
            pixelsGenerated++
            const progress = pixelsGenerated / markovPixels.countPixels
            onProgress(progress, markovPixels)
          })
        }
      }

      iterate()
    })
  }
}