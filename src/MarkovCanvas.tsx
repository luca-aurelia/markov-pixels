import React, { Component, CSSProperties } from 'react'
import { Pixel, Point } from './PixelMatrix'
import MarkovImageGenerator, { expansionAlgorithms, initializationAlgorithms, initialize, expand } from './MarkovImageGenerator'
import BrowserPixelMatrix from './BrowserPixelMatrix'
import arrayShuffle from 'array-shuffle';

interface MarkovCanvasProps {
  delay: number,
  width: number,
  height: number,
  padding: number,
  rate: number,
  sources: string[],
  zIndex: number,
  expansionAlgorithm?: expand,
  initializationAlgorithm?: initialize
}

const sortByGreen = (a: Pixel, b: Pixel) => {
  if (a.green === b.green) return 0
  else if (a.green > b.green) return 1
  else if (a.green < b.green) return -1
  else throw new RangeError('Unstable comparison: ' + a + ' cmp ' + b)
}

const brightness = (pixel: Pixel) => pixel.red + pixel.green + pixel.blue

const sortByBrightness = (a: Pixel, b: Pixel) => {
  const aBrightness = brightness(a)
  const bBrightness = brightness(b)
  if (aBrightness === bBrightness) return 0
  else if (aBrightness > bBrightness) return 1
  else if (aBrightness < bBrightness) return -1
  else throw new RangeError('Unstable comparison: ' + a + ' cmp ' + b)
}

const getDistance = (a: Point, b: Point) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
const getDiamondDistance = (a: Point, b: Point, width: number, height: number) => {
  let x = a.x - a.x
  let y = a.y - b.y
  if (x < 0) x *= -1
  if (y < 0) y *= -1
  return (x + y) / (width + height)
}

class MarkovCanvas extends Component {
  props: MarkovCanvasProps
  state: {
    trained: boolean
  }
  canvas: HTMLCanvasElement | undefined
  generator: MarkovImageGenerator | undefined
  constructor(props: MarkovCanvasProps) {
    super(props)
    this.props = props
    this.state = {
      trained: false
    }
  }
  receiveRef = async (canvas: HTMLCanvasElement) => {
    this.canvas = canvas
    this.canvas.width = this.props.width
    this.canvas.height = this.props.height

    setTimeout(this.generatePixels, this.props.delay)
  }
  onTrainingProgress = (progress: number) => {
  }
  componentDidMount = () => {
    this.train()
  }
  train = async () => {
    console.log('training')
    const src = arrayShuffle(this.props.sources)[0]
    const trainingData = await BrowserPixelMatrix.load(src)
    this.generator = new MarkovImageGenerator(src, trainingData)
    await this.generator.train(this.onTrainingProgress, sortByBrightness)
    console.log('trained')
    this.setState({ trained: true })
  }
  generatePixels = () => {
    if (!this.generator) throw new Error('Can\'t generate pixels without generator')
    // const expansionAlgorithm = arrayShuffle(expansionAlgorithms)[0]
    let expansionAlgorithm: expand = 'expandPointsInRandomBlobs'
    expansionAlgorithm = this.props.expansionAlgorithm || expansionAlgorithm
    // const initializationAlgorithm = arrayShuffle(initializationAlgorithms)[0]
    let initializationAlgorithm: initialize = 'initializeInCenter'
    initializationAlgorithm = this.props.initializationAlgorithm || initializationAlgorithm
    console.log(expansionAlgorithm)
    console.log(initializationAlgorithm)

    let currentStep = 0

    const center = { x: this.props.width / 2, y: this.props.height / 2 }
    const maxDistance = getDistance(center, { x: this.props.width, y: this.props.height })
    const getDistanceFromCenter = (pixel: Pixel, point: Point) => {
      const distance = getDistance(center, point) / maxDistance
      return distance
    }
    const getDiamondDistanceFromCenter = (pixel: Pixel, point: Point) => {
      let x = point.x - center.x
      let y = point.y - center.y
      if (x < 0) x *= -1
      if (y < 0) y *= -1
      return (x + y) / (center.x + center.y)
    }
    const getInferenceParameter = (pixel: Pixel, point: Point) => {
      const ip = getDiamondDistanceFromCenter(pixel, point)
      if (Math.random() > 0.999) console.log(ip)
      return ip
    }

    const generatePixels = this.generator.getPixelsGenerator(
      [this.props.width, this.props.height],
      this.props.rate,
      initializationAlgorithm,
      expansionAlgorithm
    )

    const iterate = () => {
      // const inferenceParameter = Math.min(1, currentStep / totalSteps)
      const generated = generatePixels()
      currentStep += 1
      if (generated.progress < 1) {
        window.requestAnimationFrame(iterate)
      }

      if (!this.canvas) throw new Error('Can\'t generate pixels without canvas')
      generated.pixels.putPixels(this.canvas)
    }

    iterate()
  }
  render() {
    const style: CSSProperties = {
      width: this.props.width + 'px',
      height: this.props.height + 'px',
      imageRendering: 'pixelated',
      padding: this.props.padding + 'px',
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: this.props.zIndex
    }
    if (this.state.trained) {
      return <canvas ref={this.receiveRef} onClick={this.generatePixels} style={style} />
    } else {
      return <div style={{ width: this.props.width + 'px', height: this.props.height + 'px' }}>Training...</div>
    }
  }
}

export default MarkovCanvas
