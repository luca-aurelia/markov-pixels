#!/usr/bin/env node
pen

const path = require('path')
const Chain = require('./markov-chains')
const readJsonFromStdin = require('./readJsonFromStdin')
const CliProgress = require('cli-progress')

const MAX_STATES = 100 * 100

const generateMarkovPixels = trainingData => {
  const stateSize = 100
  const states = [trainingData]
  const chain = new Chain(states, { stateSize })
  const progressBar = new CliProgress.Bar()
  progressBar.start(MAX_STATES, 0)

  // const markovPixels = []
  // let previousState = chain.generate()
  // for (let i = 0; i < trainingData.length; i++) {
  //   const newState = chain.move(previousState)
  //   markovPixels.push(newState)
  //   previousState = newState
  // }
  const markovPixels = []
  const chainGenerator = chain.generate(undefined, MAX_STATES)
  for (let i = 0; i < MAX_STATES; i++) {
    const pixel = chainGenerator.next().value
    if (!pixel) break
    progressBar.update(i)
    markovPixels.push(pixel)
  }

  progressBar.stop()

  return markovPixels
}

module.exports = generateMarkovPixels

const writeMarkovPixelsToStandardOut = async () => {
  const trainingData = await readJsonFromStdin()
  const markovPixels = generateMarkovPixels(trainingData)
  console.log(JSON.stringify(markovPixels))
}

const scriptName = path.basename(__filename)
const wasCalledFromCommandLine = process.argv[1].indexOf(scriptName) > -1

if (wasCalledFromCommandLine) {
  writeMarkovPixelsToStandardOut()
}
