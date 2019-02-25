import React, { Component, CSSProperties } from 'react'
import { Pixel, Point } from './PixelMatrix'
import MarkovImageGenerator, { expansionAlgorithms, initializationAlgorithms, initialize, expand } from './MarkovImageGenerator'
import BrowserPixelMatrix from './BrowserPixelMatrix'
import PixelMatrix from './PixelMatrix'
import arrayShuffle from 'array-shuffle';
import gradient from './images/gradient.jpg'
import gradient2 from './images/gradient2.jpg'
import gradient3 from './images/gradient3.jpg'
import gradient4 from './images/gradient4.jpg'

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
const normalizedBrightness = (pixel: Pixel) => brightness(pixel) / 765

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
  src: string
  trainingData?: PixelMatrix
  constructor(props: MarkovCanvasProps) {
    super(props)
    this.props = props
    this.state = {
      trained: false
    }
    this.src = arrayShuffle(this.props.sources)[0]
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
    this.trainingData = await BrowserPixelMatrix.load(this.src)
    this.generator = new MarkovImageGenerator(this.src, this.trainingData)
    await this.generator.train(this.onTrainingProgress, sortByGreen)
    console.log('trained')
    this.setState({ trained: true })
  }
  generatePixels = async () => {
    if (!this.generator) throw new Error('Can\'t generate pixels without generator')
    if (!this.trainingData) throw new Error('Can\'t generate pixels before loading training data.')

    let expansionAlgorithm: expand = 'expandPointsInRandomBlobs'
    expansionAlgorithm = this.props.expansionAlgorithm || expansionAlgorithm
    let initializationAlgorithm: initialize = 'initializeRandomly'
    initializationAlgorithm = this.props.initializationAlgorithm || initializationAlgorithm
    console.log(expansionAlgorithm)
    console.log(initializationAlgorithm)

    const center = { x: this.props.width / 2, y: this.props.height / 2 }
    const maxDistance = getDistance(center, { x: this.props.width, y: this.props.height })
    const getNormalizedDistanceFromCenter = (pixel: Pixel, point: Point) => {
      return getDistance(center, point) / maxDistance
    }
    const getNormalizedDiamondDistanceFromCenter = (pixel: Pixel, point: Point) => {
      let x = point.x - center.x
      let y = point.y - center.y
      if (x < 0) x *= -1
      if (y < 0) y *= -1
      return (x + y) / (center.x + center.y)
    }
    const getDiamondRampWavesInferenceParameter = (pixel: Pixel, point: Point) => {
      const distance = getNormalizedDiamondDistanceFromCenter(pixel, point)
      return (distance * 10) % 1
    }
    const getVectorFromCenter = (pixel: Pixel, point: Point) => {
      return {
        x: point.x - center.x,
        y: point.y - center.y
      }
    }
    const otherImage = await BrowserPixelMatrix.load(gradient4)
    const otherImageCenter = otherImage.getCenter()
    const getInferenceParameterFromOtherImage = (pixel: Pixel, point: Point) => {
      const distanceFromCenter = getVectorFromCenter(pixel, point)
      const otherImagePoint = {
        x: otherImageCenter.x + distanceFromCenter.x,
        y: otherImageCenter.y + distanceFromCenter.y
      }
      const otherImagePixel = otherImage.get(otherImagePoint)
      return normalizedBrightness(otherImagePixel) * 0.8 + 0.1
    }
    const getInferenceParameterFromY = (pixel: Pixel, point: Point) => {
      return point.y / this.props.height
    }

    const generatePixels = this.generator.getPixelsGenerator(
      [this.props.width, this.props.height],
      this.props.rate,
      initializationAlgorithm,
      expansionAlgorithm,
      getDiamondRampWavesInferenceParameter
    )

    const iterate = () => {
      const generated = generatePixels()
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
