import * as urlParser from 'url'
import * as micro from 'micro'
import { ServerResponse } from 'http'
import NodeMarkovImageGenerator from './NodeMarkovImageGenerator'
import NodePixelMatrix from './NodePixelMatrix'
import reportProgress from '../shared/reportProgress'

const createGenerator = async (trainingImageUrl: string) => {
  const trainingPixels = await NodePixelMatrix.load(trainingImageUrl)
  const generator = new NodeMarkovImageGenerator()
  generator.train(trainingPixels, reportProgress('Training'))
  return generator
}

interface GeneratorPromisesByUrl {
  [url: string]: Promise<NodeMarkovImageGenerator>
}

const getFirstIfArray = (x: string | string[]) => {
  if (Array.isArray(x)) {
    return x[0]
  } else {
    return x
  }
}

const generatorPromises: GeneratorPromisesByUrl = {
  default: createGenerator('input-images/headlight-motion-blur.jpg')
}

export default async (req: Request, res: ServerResponse) => {
  const url = urlParser.parse(req.url, true)
  const options = url.query
  console.log({ options })

  const trainingImageUrl = getFirstIfArray(options['training-image']) || 'default'
  const generatorPromise = generatorPromises[trainingImageUrl] || createGenerator(trainingImageUrl)
  generatorPromises[trainingImageUrl] = generatorPromise

  const generator = await generatorPromise
  const pngStream = generator.generatePngStream([100, 100], reportProgress('Generating'))
  micro.send(res, 200, pngStream)
}
