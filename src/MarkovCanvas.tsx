import React, { Component } from 'react'
import PixelMatrix from './PixelMatrix'
import MarkovImageGenerator from './MarkovImageGenerator'
import BrowserPixelMatrix from './BrowserPixelMatrix'

class App extends Component {
  props: {
    delay: number,
    width: number,
    height: number,
    padding: number,
    rate: number,
    src: string
  }
  state: {
    trained: boolean
  }
  canvas: HTMLCanvasElement
  generator: MarkovImageGenerator
  constructor(props) {
    super(props)
    this.state = {
      trained: false
    }
  }
  receiveRef = async canvas => {
    this.canvas = canvas
    this.canvas.width = this.props.width
    this.canvas.height = this.props.height

    setTimeout(this.generatePixels, this.props.delay)
  }
  onTrainingProgress = progress => {

  }
  componentDidMount = async () => {
    const trainingData = await BrowserPixelMatrix.load(this.props.src)
    this.generator = new MarkovImageGenerator(trainingData)
    this.generator.train(this.onTrainingProgress)
    this.setState({ trained: true }, () => this.generatePixels())
  }
  generatePixels = () => {
    const generatePixels = this.generator.getPixelsGenerator([this.props.width, this.props.height], this.props.rate, 'initializeInCenter', 'expandPoints')

    const iterate = () => {
      const generated = generatePixels()
      if (generated.progress < 1) {
        window.requestAnimationFrame(iterate)
      }
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

export default App
