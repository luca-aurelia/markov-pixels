const path = require('path')
const fs = require('fs')
const imageToPixels = require('./imageToPixels')
const CliProgress = require('cli-progress')

const imagesToPixels = async directory => {
  const fileNames = fs
    .readdirSync(directory)
    .filter(fileName => fileName.indexOf('.DS_Store') === -1)
  const progressBar = new CliProgress.Bar()
  progressBar.start(fileNames.length, 0)
  let complete = 0
  const promises = fileNames.map(fileName =>
    imageToPixels(directory + '/' + fileName).then(pixels => {
      complete++
      progressBar.update(complete)
      return pixels
    })
  )
  const images = await Promise.all(promises)
  progressBar.stop()
  const pixels = [].concat(...images)
  return pixels
}

module.exports = imagesToPixels

const scriptName = path.basename(__filename)
const wasCalledFromCommandLine = process.argv[1].indexOf(scriptName) > -1

const main = async () => {
  const pixels = await imagesToPixels(process.argv[2])
  console.log(JSON.stringify(pixels))
}

if (wasCalledFromCommandLine) {
  main()
}
