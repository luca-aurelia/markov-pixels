#!/usr/bin/env node

const getPixels = require('get-pixels')
const cli = require('./cli')

const imageToPixels = imagePath =>
  new Promise((resolve, reject) => {
    getPixels(imagePath, (err, pixelData) => {
      if (err) {
        reject(err)
        return
      }
      const [width, height] = pixelData.shape
      const pixels = []
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const pixel = {
            r: pixelData.get(x, y, 0),
            g: pixelData.get(x, y, 1),
            b: pixelData.get(x, y, 2),
            a: pixelData.get(x, y, 3)
          }
          pixels.push(pixel)
        }
      }

      resolve(pixels)
    })
  })

module.exports = imageToPixels

const writePixelsToStandardOut = async imagePath => {
  const pixels = await imageToPixels(imagePath)
  console.log(JSON.stringify(pixels))
}

cli(writePixelsToStandardOut, __filename, ['string'])
