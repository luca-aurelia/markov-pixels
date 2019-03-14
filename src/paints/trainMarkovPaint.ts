import PixelMatrix, { Pixel, Point } from '../PixelMatrix'
import HiMarkov, { StateTransition, StateSorter, SerializedTransitionsByFromState } from '../HiMarkov'

export type getInferenceParameter = (pixel: Pixel, point: Point) => number

const pixelSorterNoOp = (a: Pixel, b: Pixel): -1 | 0 | 1 => 0

const pixelCodec = {
  encode(pixel: Pixel) {
    return pixel.red + ',' + pixel.green + ',' + pixel.blue + ',' + pixel.alpha
  },
  decode(encodedPixel: string): Pixel {
    const [red, green, blue, alpha] = encodedPixel.split(',').map(s => parseInt(s, 10))
    return { red, green, blue, alpha }
  }
}

const twoFiveSixSquared = 256 * 256
const numberCodec = {
  encode({ red, green, blue, alpha }: Pixel) {
    return red + (green * 256) + (blue * twoFiveSixSquared)
  },
  decode(n: number) {
    return {
      red: Math.round(n % 256),
      green: Math.round((n / 256) % 256),
      blue: Math.round(n / (twoFiveSixSquared)),
      alpha: 255
    }
  }
}

export const stringCodecs = {
  from: pixelCodec,
  to: pixelCodec
}

export const numberCodecs = {
  from: numberCodec,
  to: numberCodec
}

const onTrainingProgressNoOp = (progress: number) => { }
type onProgress = (progress: number) => void
type pixelSorter = (a: Pixel, b: Pixel) => -1 | 0 | 1

export const train = async (trainingData: PixelMatrix, onProgress: onProgress, pixelSorter: pixelSorter) => {
  // let serializedTrainingData = await localForage.getItem(trainingDataKey) as SerializedTransitionsByFromState<Pixel>
  // if (serializedTrainingData != null) {
  //   console.log('loading from serialized')
  //   return HiMarkov.fromSerialized(pixelStateTransitionCodec, serializedTrainingData, pixelSorter)
  // }

  // const markovChain = new GraphMarkov(numberCodecs, pixelSorter, trainingDataSize)
  const markovChain = new HiMarkov(stringCodecs, [], pixelSorter)
  const trainingDataSize = trainingData.width * trainingData.height
  const numberOfMooreNeighbors = 8
  // This slightly overestimates the number of state transitions since pixels on the
  // edge of the matrix don't actually have 8 Moore neighbors
  let totalStateTransitions = trainingData.countPixels * numberOfMooreNeighbors
  let stateTransitionsRecorded = 0
  console.log('recording state transitions  ')
  trainingData.forEach((pixel: Pixel, point: Point) => {
    trainingData.getMooreNeighboringPixels(point).forEach(neighbor => {
      const stateTransition: StateTransition<Pixel, Pixel> = [pixel, neighbor]
      markovChain.recordStateTransition(stateTransition)
      stateTransitionsRecorded++
      onProgress(stateTransitionsRecorded / totalStateTransitions)
    })
  })

  // console.log('state transitions recorded. caching state transitions.')
  // localForage.setItem(trainingDataKey, markovChain.serializeStateTransitions())

  return markovChain
}

const getMarkovPainter = (markovChain: HiMarkov<Pixel, Pixel>, getInferenceParameter?: getInferenceParameter) => (markovPixels: PixelMatrix, point: Point, neighbor: Point) => {
  const color = markovPixels.get(point)

  let inferenceParameter
  if (getInferenceParameter) inferenceParameter = getInferenceParameter(color, neighbor)

  const prediction = markovChain!.predict(color, inferenceParameter)
  if (!prediction) {
    console.warn('Prediction failed')
    return
  }

  if (Math.random() < 0.01) console.log('painting')

  markovPixels.set(neighbor, prediction)
}

export default async (trainingData: PixelMatrix, onTrainingProgress = onTrainingProgressNoOp, pixelSorter = pixelSorterNoOp, getInferenceParameter?: getInferenceParameter) => {
  const markovChain = await train(trainingData, onTrainingProgress, pixelSorter)
  return getMarkovPainter(markovChain, getInferenceParameter)
}