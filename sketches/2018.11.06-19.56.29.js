const fs = require('fs')
const { createCanvas, ImageData } = require('canvas')
const loadPixelMatrix = require('../built/src/loadPixelMatrix').default
const MarkovImageGenerator = require('../built/src/MarkovImageGenerator')
  .default

const settings = {
  dimensions: [4096, 4096]
}

settings.canvas = createCanvas(settings.dimensions[0], settings.dimensions[1])
const rate = 150

const reportProgress = verb => {
  let previousPercent = -1
  return progress => {
    const percent = Math.round(progress * 100)
    if (percent !== previousPercent) {
      previousPercent = percent
      console.log(`${verb}... ${percent}%`)
    }
  }
}

const sketch = async () => {
  // const src = 'http://192.168.88.12:9966/images/kawase/borderless/sc205834.jpg'
  const src = './images/kawase/borderless/sc205834.jpg'
  const trainingData = await loadPixelMatrix(src)
  const generator = new MarkovImageGenerator(trainingData)

  console.log('training')
  generator.train(reportProgress('Training'))
  console.log('training complete')

  const reportGenerationProgress = reportProgress('Generating')
  const generatePixels = generator.getPixelsGenerator(
    settings.dimensions,
    rate,
    'initializeInCenter',
    'expandPoints'
  )

  let generated = generatePixels()
  while (generated.progress < 1) {
    generated = generatePixels()
    generated.pixels.putPixels(settings.canvas, ImageData)
    reportGenerationProgress(generated.progress)
  }
}

sketch().then(() => {
  const stream = settings.canvas.createPNGStream()
  const out = fs.createWriteStream('output.png')
  stream.pipe(out)
  out.on('finish', () => console.log('Done rendering'))
})
