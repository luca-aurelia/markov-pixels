import React, { Component } from 'react'
import './App.css'
import BrowserPixelMatrix from './BrowserPixelMatrix'
import MarkovImageGenerator from './MarkovImageGenerator'
import PixelMatrix from './PixelMatrix';
import photoUrl from './saigetsu-small.jpg'

const width = 500
const height = width
let i = 0
class App extends Component {
  canvas: HTMLCanvasElement
  onTrainingProgress = (trainingProgress: number) => {
  }
  onGenerationProgress = (generationProgress: number, inProgressMarkovPixelMatrix: PixelMatrix) => {
    // i++
    // if (i % 100 === 0) {
    inProgressMarkovPixelMatrix.putPixels(this.canvas)
    // }
  }
  receiveRef = async canvas => {
    this.canvas = canvas
    this.canvas.width = width
    this.canvas.height = height

    const trainingData = await BrowserPixelMatrix.load(photoUrl)
    const generator = new MarkovImageGenerator(trainingData)
    generator.train(this.onTrainingProgress)
    const markovPixels = await generator.generatePixels([width, height], this.onGenerationProgress)
    markovPixels.putPixels(this.canvas)
    console.log('complete')
  }
  render() {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}><canvas ref={this.receiveRef} style={{ width: width + 'px', height: height + 'px', imageRendering: 'pixelated' }} /></div>
  }
}

export default App
