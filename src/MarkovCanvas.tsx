import React, { Component } from 'react'
import PixelMatrix from './PixelMatrix'
import MarkovImageGenerator, { pixelStateTransitionCodec } from './MarkovImageGenerator'
import BrowserPixelMatrix from './BrowserPixelMatrix'
import HiMarkov from './HiMarkov';

interface MarkovCanvasProps {
  delay: number,
  width: number,
  height: number,
  padding: number,
  rate: number,
  src: string,
  trainingDataSrc: string
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
  onTrainingProgress = () => {

  }
  componentDidMount = async () => {
    // const markovChain = new HiMarkov(pixelStateTransitionCodec)
    const trainingData = await BrowserPixelMatrix.load(this.props.src)
    // const transitionCounts = await window.fetch(`http://localhost:3001/?training-image=${this.props.trainingDataSrc}`).then(response => response.json())
    // markovChain.transitionCounts = transitionCounts
    this.generator = new MarkovImageGenerator(trainingData)
    this.generator.train()
    this.setState({ trained: true }, () => this.generatePixels())
  }
  generatePixels = () => {
    if (!this.generator) throw new Error('Can\'t generate pixels without generator')
    const generatePixels = this.generator.getPixelsGenerator([this.props.width, this.props.height], this.props.rate, 'initializeInCenter', 'expandPoints')

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
    if (this.state.trained) {
      return <canvas ref={this.receiveRef} onClick={this.generatePixels} style={{ width: this.props.width + 'px', height: this.props.height + 'px', imageRendering: 'pixelated', padding: this.props.padding + 'px' }} />
    } else {
      return <div style={{ width: this.props.width + 'px', height: this.props.height + 'px' }}>Training...</div>
    }
  }
}

export default MarkovCanvas
