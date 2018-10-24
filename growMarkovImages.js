const cli = require('./cli')
const growMarkovImage = require('./growMarkovImage')
const asyncMapFiles = require('./asyncMapFiles')

const growMarkovImages = async (
  inputGlobPattern,
  outputDirectory,
  outputShape
) => {
  const mapper = imagePath =>
    growMarkovImage(imagePath, outputDirectory, outputShape)
  await asyncMapFiles(mapper, inputGlobPattern)
}

module.exports = growMarkovImages

cli(growMarkovImages, __filename, ['string', 'string', 'dimensions'])
