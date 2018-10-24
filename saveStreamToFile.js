const fs = require('fs')

const saveStreamToFile = (stream, path) =>
  new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path)
    stream.pipe(writeStream)
    writeStream.on('finish', resolve)
  })

module.exports = saveStreamToFile
