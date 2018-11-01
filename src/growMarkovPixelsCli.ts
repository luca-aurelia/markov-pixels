import * as path from 'path'
import growMarkovPixels from './growMarkovPixels'
import NodePixelMatrix from './NodePixelMatrix'
import Shape from './types/Shape'
import getUnusedFilePath from './getUnusedFilePath'
import cli, { ArgumentTypes } from './cli'

const growMarkovImage = async (
  inputImagePath: string,
  outputDirectory: string,
  outputShape: Shape
) => {
  const trainingPixels = await NodePixelMatrix.load(inputImagePath)
  const markovPixels = growMarkovPixels(trainingPixels, outputShape)
  const markovImagePath = getUnusedFilePath(
    outputDirectory,
    path.parse(inputImagePath).name,
    '.png'
  )
  await NodePixelMatrix.fromPixelMatrix(markovPixels).saveAsPNG(markovImagePath)
}

cli(growMarkovImage, __filename, [ArgumentTypes.string, ArgumentTypes.string, ArgumentTypes.shape])