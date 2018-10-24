#!/usr/bin/env node

const savePixels = require('save-pixels')
const ndarray = require('ndarray')
const path = require('path')
const readJsonFromStdin = require('./readJsonFromStdin')
const saveStreamToFile = require('./saveStreamToFile')

const pixelsToImage = (pixels, width, height) => {
  const ints = []
  pixels.forEach(({ r, g, b, a }) => {
    ints.push(r)
    ints.push(g)
    ints.push(b)
    ints.push(a)
  })
  const array = ndarray(Int8Array.from(ints), [width, height, 4])
  return array
}

const savePixelsToFile = async (pixels, outputPath, outputShape) => {
  const [width, height] = outputShape
  const image = pixelsToImage(pixels, width, height)
  const parsed = path.parse(outputPath)
  const imageType = parsed.ext.substring(1, parsed.ext.length) // get rid of leading '.'
  const pixelStream = savePixels(image, imageType)
  await saveStreamToFile(pixelStream, outputPath)
}

module.exports = savePixelsToFile

const scriptName = path.basename(__filename)
const wasCalledFromCommandLine = process.argv[1].indexOf(scriptName) > -1

const main = async () => {
  const pixels = await readJsonFromStdin()
  const outputPath = process.argv[2]
  const width = global.parseInt(process.argv[3], 10)
  const height = global.parseInt(process.argv[4], 10)
  savePixelsToFile(pixels, outputPath, [width, height])
}

if (wasCalledFromCommandLine) {
  main()
}
