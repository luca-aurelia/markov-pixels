import * as urlParser from 'url'
import * as micro from 'micro'
import { ServerResponse } from 'http'
import { train } from './MarkovImageGenerator'
import PixelMatrix from './PixelMatrix'
import loadPixelMatrix from './loadPixelMatrix'
import reportProgress from '../shared/reportProgress'
import { TransitionCounts } from './HiMarkov'
import fs from 'fs'

const trainOnUrl = async (trainingImageUrl: string) => {
  const trainingPixels = await loadPixelMatrix(trainingImageUrl)
  const markovChain = train(trainingPixels, reportProgress('Training'))
  return markovChain.transitionCounts
}

const getFirstIfArray = (x: string | string[]) => {
  if (Array.isArray(x)) {
    return x[0]
  } else {
    return x
  }
}

interface TransitionCountPromisesByUrl {
  [url: string]: Promise<TransitionCounts>
}

const transitionCountPromisesByUrl: TransitionCountPromisesByUrl = {}

export default async (req: Request, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')
  const url = urlParser.parse(req.url, true)
  const options = url.query

  const trainingImageUrl = getFirstIfArray(options['training-image'])

  const fileName = `./src/transitionCounts/${trainingImageUrl.replace(/\//g, '-')}.json`
  if (fs.existsSync(fileName)) {
    const transitionCounts = await fs.promises.readFile(fileName)
    micro.send(res, 200, transitionCounts)
  } else {
    const transitionCounts = JSON.stringify(await trainOnUrl(trainingImageUrl))
    await fs.promises.writeFile(fileName, transitionCounts)
    micro.send(res, 200, transitionCounts)
  }
}
