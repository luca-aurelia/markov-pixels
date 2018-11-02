import * as path from 'path'
import MarkovImageGenerator from '../shared/MarkovImageGenerator'
import NodePixelMatrix from '../shared/NodePixelMatrix'
import getUnusedFilePath from '../shared/getUnusedFilePath'
import cli, { ArgumentTypes } from './cli'
import Shape from '../types/Shape'
import reportProgress from '../shared/reportProgress'

const growMarkovImage = async (
  inputImagePath: string,
  outputDirectory: string,
  outputShape: Shape
) => {
  console.time('total')
  const trainingPixels = await NodePixelMatrix.load(inputImagePath)
  const generator = new MarkovImageGenerator()
  console.time('training')
  generator.train(trainingPixels)
  console.timeEnd('training')
  console.time('generating')
  const markovPixels = generator.generatePixels(outputShape)
  console.timeEnd('generating')
  console.timeEnd('total')
  const markovImagePath = getUnusedFilePath(
    outputDirectory,
    path.parse(inputImagePath).name,
    '.png'
  )
  await NodePixelMatrix.fromPixelMatrix(markovPixels).saveAsPNG(markovImagePath)
}

cli(growMarkovImage, __filename, [ArgumentTypes.string, ArgumentTypes.string, ArgumentTypes.shape])