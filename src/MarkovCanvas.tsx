import React, { Component, CSSProperties } from 'react'
import { Pixel, Point } from './PixelMatrix'
import MarkovImageGenerator, { pixelStateTransitionCodec, expansionAlgorithms, initializationAlgorithms, initialize, expand } from './MarkovImageGenerator'
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
    this.generator = new MarkovImageGenerator(trainingData)
    this.generator.train(this.onTrainingProgress, sortByBrightness)
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

    const getInferenceParameter = (pixel: Pixel, point: Point) => {
      return Math.sin(currentStep * 2) * 0.5 + 0.5
    }

    const generatePixels = this.generator.getPixelsGenerator(
      [this.props.width, this.props.height],
      this.props.rate,
      initializationAlgorithm,
      expansionAlgorithm,
      getInferenceParameter
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
