'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const PixelMatrix_1 = __importDefault(require('./PixelMatrix'))
const HiMarkov_1 = __importDefault(require('./HiMarkov'))
const double_ended_queue_1 = __importDefault(require('double-ended-queue'))
const array_shuffle_1 = __importDefault(require('array-shuffle'))
const trainNoOp = progress => {}
const generateNoOp = (progress, pixelMatrixInProgress) => {}
const pixelCodec = {
  encode (pixel) {
    return pixel.red + ',' + pixel.green + ',' + pixel.blue + ',' + pixel.alpha
  },
  decode (encodedPixel) {
    const [red, green, blue, alpha] = encodedPixel
      .split(',')
      .map(s => parseInt(s, 10))
    return { red, green, blue, alpha }
  }
}
exports.pixelStateTransitionCodec = {
  from: pixelCodec,
  to: pixelCodec
}
exports.train = (trainingData, onProgress = trainNoOp) => {
  const markovChain = new HiMarkov_1.default(exports.pixelStateTransitionCodec)
  const numberOfMooreNeighbors = 8
  // This slightly overestimates the number of state transitions since pixels on the
  // edge of the matrix don't actually have 8 Moore neighbors
  let totalStateTransitions = trainingData.countPixels * numberOfMooreNeighbors
  let stateTransitionsRecorded = 0
  trainingData.forEach((pixel, point) => {
    trainingData.getMooreNeighboringPixels(point).forEach(neighbor => {
      const stateTransition = [pixel, neighbor]
      markovChain.recordStateTransition(stateTransition)
      stateTransitionsRecorded++
      onProgress(stateTransitionsRecorded / totalStateTransitions)
    })
  })
  return markovChain
}
class MarkovImageGenerator {
  constructor (trainingData, markovChain) {
    this.trainingData = trainingData
    this.markovChain = markovChain
  }
  train (onProgress = trainNoOp) {
    this.markovChain = exports.train(this.trainingData, onProgress)
  }
  getPixelsGenerator (
    outputShape,
    rate = 10,
    initializationAlgorithm = 'initializeInCenter',
    expansionAlgorithm = 'expandPointsInRandomWalk'
  ) {
    if (!this.markovChain) {
      throw new Error(
        `Can't generate pixels without a markov chain. Make sure you called MarkovImageGenerator#train before trying to generate pixels.`
      )
    }
    const [outputWidth, outputHeight] = outputShape
    const markovPixels = new PixelMatrix_1.default(outputWidth, outputHeight)
    const pointsToExpandFrom = new double_ended_queue_1.default(
      markovPixels.countPixels
    )
    this[initializationAlgorithm](markovPixels, pointsToExpandFrom)
    let pixelsGenerated = 0
    const generatePixels = () => {
      if (pointsToExpandFrom.length > 0) {
        const pointsExpanded = this[expansionAlgorithm](
          rate,
          pointsToExpandFrom,
          markovPixels
        )
        pixelsGenerated += pointsExpanded
      }
      const progress = pixelsGenerated / markovPixels.countPixels
      return {
        progress,
        pixels: markovPixels
      }
    }
    return generatePixels
  }
  initializeInCenter (markovPixels, pointsToExpandFrom) {
    const startingPoint = markovPixels.getCenter()
    const startingColor = this.trainingData.getRandomPixel()
    markovPixels.set(startingPoint, startingColor)
    pointsToExpandFrom.push(startingPoint)
  }
  initializeRandomly (markovPixels, pointsToExpandFrom) {
    const randomlyInitializeMarkovPixel = () => {
      const startingPoint = markovPixels.getRandomPoint()
      const startingColor = this.trainingData.getRandomPixel()
      markovPixels.set(startingPoint, startingColor)
      pointsToExpandFrom.push(startingPoint)
    }
    for (let i = 0; i < 3; i++) {
      randomlyInitializeMarkovPixel()
    }
  }
  expandPointsInRandomBlobs (expansionRate, pointsToExpandFrom, markovPixels) {
    const expand = point => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = array_shuffle_1.default(neighbors)
      shuffledNeighbors.forEach(neighbor => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (
          neighboringPixel.red ||
          neighboringPixel.green ||
          neighboringPixel.blue ||
          neighboringPixel.alpha
        ) { return }
        const neighborColor = this.markovChain.predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighbor, neighborColor)
        if (Math.random() > 0.5) {
          pointsToExpandFrom.unshift(neighbor)
        } else {
          // pointsToExpandFrom.push(neighbor)
        }
      })
    }
    let pointsExpanded = 0
    for (let i = 0; i < expansionRate; i++) {
      const point = pointsToExpandFrom.pop()
      if (!point) break
      expand(point)
      pointsExpanded++
    }
    return pointsExpanded
  }
  expandPointsInRandomWalk (expansionRate, pointsToExpandFrom, markovPixels) {
    const expand = point => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = array_shuffle_1.default(neighbors)
      shuffledNeighbors.forEach(neighbor => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (
          neighboringPixel.red ||
          neighboringPixel.green ||
          neighboringPixel.blue ||
          neighboringPixel.alpha
        ) { return }
        const neighborColor = this.markovChain.predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighbor, neighborColor)
        if (Math.random() > 0.5) {
          pointsToExpandFrom.unshift(neighbor)
        } else {
          pointsToExpandFrom.push(neighbor)
        }
      })
    }
    let pointsExpanded = 0
    for (let i = 0; i < expansionRate; i++) {
      const point = pointsToExpandFrom.pop()
      if (!point) break
      expand(point)
      pointsExpanded++
    }
    return pointsExpanded
  }
  expandPoints (expansionRate, pointsToExpandFrom, markovPixels) {
    const expand = point => {
      const color = markovPixels.get(point)
      const neighbors = markovPixels.getMooreNeighboringPoints(point)
      const shuffledNeighbors = array_shuffle_1.default(neighbors)
      shuffledNeighbors.forEach(neighbor => {
        const neighboringPixel = markovPixels.get(neighbor)
        // console.log({ neighboringPixel })
        // if neighbor is already colored, don't change color
        if (
          neighboringPixel.red ||
          neighboringPixel.green ||
          neighboringPixel.blue ||
          neighboringPixel.alpha
        ) { return }
        const neighborColor = this.markovChain.predict(color)
        if (!neighborColor) throw new Error(`Prediction failed`)
        markovPixels.set(neighbor, neighborColor)
        pointsToExpandFrom.push(neighbor)
      })
    }
    let pointsExpanded = 0
    for (let i = 0; i < expansionRate; i++) {
      const point = pointsToExpandFrom.pop()
      if (!point) break
      expand(point)
      pointsExpanded++
    }
    return pointsExpanded
  }
}
exports.default = MarkovImageGenerator
