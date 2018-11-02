'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const path = require('path')
const MarkovImageGenerator_1 = require('./MarkovImageGenerator')
const NodePixelMatrix_1 = require('./NodePixelMatrix')
const getUnusedFilePath_1 = require('./getUnusedFilePath')
const cli_1 = require('./cli')
const reportProgress_1 = require('./reportProgress')
const growMarkovImage = async (
  inputImagePath,
  outputDirectory,
  outputShape
) => {
  const trainingPixels = await NodePixelMatrix_1.default.load(inputImagePath)
  const generator = new MarkovImageGenerator_1.default()
  generator.train(trainingPixels, reportProgress_1.default('Training'))
  const markovPixels = generator.generatePixels(
    outputShape,
    reportProgress_1.default('Generating')
  )
  const markovImagePath = getUnusedFilePath_1.default(
    outputDirectory,
    path.parse(inputImagePath).name,
    '.png'
  )
  await NodePixelMatrix_1.default
    .fromPixelMatrix(markovPixels)
    .saveAsPNG(markovImagePath)
}
cli_1.default(growMarkovImage, __filename, [
  cli_1.ArgumentTypes.string,
  cli_1.ArgumentTypes.string,
  cli_1.ArgumentTypes.shape
])
