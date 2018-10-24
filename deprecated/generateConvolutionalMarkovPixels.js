#!/usr/bin/env node

const path = require('path')
const Chain = require('./markov-chains')
const readJsonFromStdin = require('./readJsonFromStdin')
const ndarray = require('ndarray')
const CliProgress = require('cli-progress')
const imageToPixels = require('./imageToPixels')

const defaultPixel = { r: -1, g: -1, b: -1, a: -1 }

const generateConvolutionalMarkovPixels = (
  trainingData,
  frameworkPixels,
  width,
  height
) => {
  const trainingData2d = ndarray(trainingData, [width, height])
  const states = [trainingData]
  const getRandomPoint = () => {
    return {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height)
    }
  }
  const getNeighbors = array2d => (x, y) => {
    const neighbors = []
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        if (xOffset === 0 && yOffset === 0) continue

        const neighborX = x + xOffset
        const neighborY = y + yOffset
        let neighbor = array2d.get(neighborX, neighborY) || defaultPixel
        neighbors.push(neighbor)
      }
    }
    return neighbors
  }

  const getTrainingData2dNeighbors = getNeighbors(trainingData2d)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const pixel = trainingData2d.get(x, y)
      const state = [...getTrainingData2dNeighbors(x, y), pixel]
      states.push(state)
    }
  }

  const stateSize = 8
  const chain = new Chain(states, { stateSize })

  // const markovPixels = []
  // let previousState = chain.generate()
  // for (let i = 0; i < trainingData.length; i++) {
  //   const newState = chain.move(previousState)
  //   markovPixels.push(newState)
  //   previousState = newState
  // }

  let markovPixels = []
  const frameworkPixels2d = ndarray(frameworkPixels, [width, height])
  const getFrameworkPixels2dNeighbors = getNeighbors(frameworkPixels2d)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // const randomPoint = getRandomPoint()
      const state = getFrameworkPixels2dNeighbors(x, y)
      const predictedPixels = chain.walk(state)
      // console.log(predictedPixels.length)
      const pixel = predictedPixels[0] || { r: 0, g: 0, b: 0, a: 255 }
      markovPixels.push(pixel)
    }
  }
  return markovPixels
}

module.exports = generateConvolutionalMarkovPixels

const writeMarkovPixelsToStandardOut = async () => {
  const width = process.argv[2]
  const height = process.argv[3]
  const trainingData = await readJsonFromStdin()
  // const frameworkPixels = await imageToPixels('./images/art.jpg')
  const frameworkPixels = trainingData
  const markovPixels = generateConvolutionalMarkovPixels(
    trainingData,
    frameworkPixels,
    width,
    height
  )
  console.log(JSON.stringify(markovPixels))
}

const scriptName = path.basename(__filename)
const wasCalledFromCommandLine = process.argv[1].indexOf(scriptName) > -1

if (wasCalledFromCommandLine) {
  writeMarkovPixelsToStandardOut()
}
