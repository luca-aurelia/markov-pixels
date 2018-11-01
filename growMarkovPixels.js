#!/usr/bin/env node

const HiMarkov = require('./src/HiMarkov')
const readJsonFromStdin = require('./readJsonFromStdin')
const CliProgress = require('cli-progress')
const ndarray = require('ndarray')
const cli = require('./cli')
const Deque = require('double-ended-queue')

const getNeighboringValues = array2d => (x, y) => {
  const [width, height] = array2d.shape
  const neighboringPoints = getNeighboringPoints(x, y, width, height)
  return neighboringPoints.map(neighbor => {
    const neighboringValue = array2d.get(neighbor.x, neighbor.y)
    return neighboringValue
  })
}

const getRandomElementFrom = collection => {
  const randomIndex = Math.floor(Math.random() * collection.length)
  return collection[randomIndex]
}

const getNeighboringPoints = (x, y, width, height) => {
  const neighbors = []
  const lastX = width - 1
  const lastY = height - 1
  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      if (xOffset === 0 && yOffset === 0) continue

      const neighborX = x + xOffset
      const neighborY = y + yOffset
      if (
        neighborX < 0 ||
        neighborX > lastX ||
        neighborY < 0 ||
        neighborY > lastY
      ) {
        continue
      }

      const neighbor = { x: neighborX, y: neighborY }
      neighbors.push(neighbor)
    }
  }
  return neighbors
}

const getRandomPoint = (width, height) => {
  return {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height)
  }
}

const growMarkovPixels = (trainingData, inputShape, outputShape) => {
  const [inputWidth, inputHeight] = inputShape
  const [outputWidth, outputHeight] = outputShape

  const stateTransitions = []
  const trainingData2d = ndarray(trainingData, [inputWidth, inputHeight])
  const getTrainingData2dNeighbors = getNeighboringValues(trainingData2d)

  // console.log('Organizing training data.')
  for (let x = 0; x < inputWidth; x++) {
    for (let y = 0; y < inputHeight; y++) {
      const pixel = trainingData2d.get(x, y)
      const neighbors = getTrainingData2dNeighbors(x, y)
      neighbors.forEach(neighbor => {
        stateTransitions.push([pixel, neighbor])
      })
    }
  }

  // console.log('Training.')
  const chain = new HiMarkov(stateTransitions)

  // const markovPixels = []
  // let previousState = chain.generate()
  // for (let i = 0; i < trainingData.length; i++) {
  //   const newState = chain.move(previousState)
  //   markovPixels.push(newState)
  //   previousState = newState
  // }
  const markovPixels = []
  const markovPixels2d = ndarray(markovPixels, [outputWidth, outputHeight])

  const points = new Deque(trainingData.length)
  for (let i = 0; i < 3; i++) {
    const startingPoint = getRandomPoint(outputWidth, outputHeight)
    const startingColor = getRandomElementFrom(trainingData)
    markovPixels2d.set(startingPoint.x, startingPoint.y, startingColor)
    points.push(startingPoint)
  }

  const countOutputPixels = outputWidth * outputHeight
  const progressBar = new CliProgress.Bar()
  progressBar.start(countOutputPixels, 0)

  let i = 0
  // console.log('Generating image.')
  while (points.length > 0) {
    // let point = null
    // if (Math.random() > 0.5) {
    //   point = points.pop()
    // } else {
    //   point = points.shift()
    // }
    const point = points.pop()
    // const randomIndex = Math.floor(Math.random() * points.length)
    // const [point] = points.splice(randomIndex, 1)
    const color = markovPixels2d.get(point.x, point.y)
    const neighbors = getNeighboringPoints(
      point.x,
      point.y,
      outputWidth,
      outputHeight
    )
    neighbors.forEach(neighbor => {
      // if neighbor is already colored, don't change color
      if (markovPixels2d.get(neighbor.x, neighbor.y)) return

      const neighborColor = chain.predict(color)
      markovPixels2d.set(neighbor.x, neighbor.y, neighborColor)
      points.unshift(neighbor)
    })
    i++
    progressBar.update(i)
  }

  progressBar.stop()

  return markovPixels
}

module.exports = growMarkovPixels

const writeMarkovPixelsToStandardOut = async (inputShape, outputShape) => {
  const trainingData = await readJsonFromStdin()
  const markovPixels = growMarkovPixels(trainingData, inputShape, outputShape)
  console.log(JSON.stringify(markovPixels))
}

cli(writeMarkovPixelsToStandardOut, __filename, ['dimensions', 'dimensions'])
