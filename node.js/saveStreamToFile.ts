import * as fs from 'fs'
import { Readable } from 'stream'

const saveStreamToFile = (stream: Readable, path: string) =>
  new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path)
    stream.pipe(writeStream)
    writeStream.on('finish', resolve)
  })

export default saveStreamToFile
