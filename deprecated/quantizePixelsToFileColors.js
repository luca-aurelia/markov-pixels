#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const readJsonFromStdin = require('./readJsonFromStdin')
const imageToPixels = require('./imageToPixels')
const dedupe = require('dedupe')
const CliProgress = require('cli-progress')

const getColorProfile = async colorProfileImagePath => {
  // console.log('Loading color profile.')
  const imageFileName = path.parse(colorProfileImagePath).name
  const colorProfilePath = `./color-profiles/${imageFileName}.json`
  if (fs.existsSync(colorProfilePath)) {
    // console.log('Color profile found in cache.')
    const unparsedColorProfile = fs.readFileSync(colorProfilePath)
    return JSON.parse(unparsedColorProfile)
  } else {
    // console.log('Color profile not in cache. Generating.')
    const pixels = await imageToPixels(colorProfileImagePath)
    const colorProfile = dedupe(pixels)
    fs.writeFileSync(colorProfilePath, JSON.stringify(colorProfile))
    return colorProfile
  }
}

const getDistanceBetween = (pixel1, pixel2) =>
  Math.sqrt(
    (pixel1.r - pixel2.r) ** 2 +
      (pixel1.g - pixel2.g) ** 2 +
      (pixel1.b - pixel2.b) ** 2 +
      (pixel1.a - pixel2.a) ** 2
  )

const findNearestPixelInColorProfile = colorProfile => pixel => {
  let closestPixelSoFar = null
  let shortestDistanceSoFar = Number.POSITIVE_INFINITY
  for (let i = 0; i < colorProfile.length; i++) {
    const colorProfilePixel = colorProfile[i]
    const distance = getDistanceBetween(pixel, colorProfilePixel)
    if (distance < shortestDistanceSoFar) {
      closestPixelSoFar = colorProfilePixel
      shortestDistanceSoFar = distance
    }
  }
  // console.log({ shortestDistanceSoFar })
  return closestPixelSoFar
}

const quantizePixelsToFileColors = async (pixels, colorProfileImagePath) => {
  // console.log('Reading pixels from stdin.')
  // console.log(
  //   `Quantizing ${pixels.length} pixels to the colors found in ${colorProfileImagePath}.`
  // )
  const colorProfile = await getColorProfile(colorProfileImagePath)
  // console.log('Color profile loaded.')
  // console.log('Quantizing.')
  const progressBar = new CliProgress.Bar()
  progressBar.start(pixels.length - 1, 0)
  const findNearestPixel = findNearestPixelInColorProfile(colorProfile)
  const quantizedPixels = pixels.map((pixel, i) => {
    const nearest = findNearestPixel(pixel)
    progressBar.update(i)
    return nearest
  })
  progressBar.stop()
  // console.log('Done.')
  console.log(JSON.stringify(quantizedPixels))
}

module.exports = quantizePixelsToFileColors

const main = async () => {
  const pixels = await readJsonFromStdin()
  quantizePixelsToFileColors(pixels, process.argv[2])
}

const scriptName = path.basename(__filename)
const wasCalledFromCommandLine = process.argv[1].indexOf(scriptName) > -1

if (wasCalledFromCommandLine) {
  main()
}
