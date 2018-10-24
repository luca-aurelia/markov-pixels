const sharp = require('sharp')
const path = require('path')
const growMarkovPixels = require('./growMarkovPixels')
const imageToPixels = require('./imageToPixels')
const savePixelsToFile = require('./savePixelsToFile')
const cli = require('./cli')
const getUnusedFilePath = require('./getUnusedFilePath')

const getShape = async imagePath => {
  const metadata = await sharp(imagePath).metadata()
  return [metadata.width, metadata.height]
}

const growMarkovImage = async (
  inputImagePath,
  outputDirectory,
  outputShape
) => {
  const inputShape = await getShape(inputImagePath)
  const trainingPixels = await imageToPixels(inputImagePath)
  const markovPixels = growMarkovPixels(trainingPixels, inputShape, outputShape)
  const markovImagePath = getUnusedFilePath(
    outputDirectory,
    path.parse(inputImagePath).name,
    '.png'
  )
  await savePixelsToFile(markovPixels, markovImagePath, outputShape)
}

module.exports = growMarkovImage

cli(growMarkovImage, __filename, ['string', 'string', 'dimensions'])
