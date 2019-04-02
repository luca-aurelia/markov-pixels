import React, { Component, CSSProperties } from 'react'
import './App.css'
import ToroidalBrowserPixelMatrix from './ToroidalBrowserPixelMatrix'
import MarkovCanvas from './MarkovCanvas'
import eases from 'eases'
import a from './images/kawase/borderless/sc205798.jpg'
import b from './images/kawase/borderless/sc205799.jpg'
import c from './images/kawase/borderless/sc205802.jpg'
import d from './images/kawase/borderless/sc205804.jpg'
import e from './images/kawase/borderless/sc205811.jpg'
import f from './images/kawase/borderless/sc205814.jpg'
import g from './images/kawase/borderless/sc205815.jpg'
import h from './images/kawase/borderless/sc205817.jpg'
import i from './images/kawase/borderless/sc205834.jpg'
import j from './images/kawase/borderless/sc205839.jpg'
import k from './images/kawase/borderless/sc205842.jpg'
import l from './images/kawase/borderless/sc205843.jpg'
import m from './images/kawase/borderless/sc205845.jpg'
import n from './images/kawase/borderless/sc205872.jpg'
import small from './images/kawase-small.jpeg'
import clock from './images/gehwerk.jpg'
import pinealCancer from './images/thornton/pineal-cancer.png'
import pinealCancerBlurred from './images/thornton/pineal-cancer-blurred.png'
import obliterationRoomFloor from './images/kusama/obliteration-room-floor.png'
import infinityNet from './images/kusama/infinity-net.jpg'
import amoebas from './images/kusama/amoebas.png'
import love from './images/kusama/love.png'
import eyes from './images/kusama/eyes.jpg'
import gallery from './images/kusama/gallery.jpg'
import mushrooms from './images/kusama/mushrooms.jpeg'
import nematodes from './images/kusama/nematodes.jpg'
import adolescence from './images/kusama/adolescence.jpg'
import wheatFieldWithCypresses from './images/van-gogh/wheat-field-with-cypresses.jpg'
import brushWork from './images/van-gogh/brush-work.jpg'
import blueVintageFlowerPrint from './images/flower-prints/blue.jpg'
import redoute from './images/flower-prints/redoute.jpg'
import vintageFlowerPrint from './images/flower-prints/print.jpg'
import manoloCrystal from './images/manolo/crystal.png'
import manoloPolygons from './images/manolo/polygons.png'
import mantel from './images/manolo/mantel.jpeg'
import brushwork2 from './images/van-gogh/brush-work-2.jpg'
import crystals from './images/frazier/crystals.png'
import unsplashBlueFlower from './images/unsplash/blue-flower.jpg'
import trainMarkovPaint from './paints/trainFakeMarkovPaint'
import getDiamondBias from './biases/diamondRampWaves'
import sortPixelsByBrightness from './sortPixelsBy/brightness'
import sortPixelsByHue from './sortPixelsBy/hue'
import sortPixelsBySaturation from './sortPixelsBy/hue'
import BrowserPixelMatrix from './BrowserPixelMatrix'
import { Pixel, Point } from './PixelMatrix'
import gradient4 from './images/gradient4.jpg'
import { initializeWithRandomColorFromTrainingData } from './initializers/color'
import { initializeInTopLeft, initializeInCenter } from './initializers/point'
import getRainStroke from './strokes/rain'
import getRandomWalkStroke from './strokes/randomWalk'
import getGoldenSpiralStroke from './strokes/goldenSpiral'
import getRandomWalkGoldenSpiralStroke from './strokes/randomWalkGoldenSpiral'
import { Stroke } from './strokes/types'
import { PointInitializer, ColorInitializer } from './initializers/types';

// const imageUrls = [a, b, c, d, e, f, g, h, i, j, k, l, m, n]

const delayStepSize = 0
const width = 3000
const height = width
const padding = 10
const containerWidth = width + (padding * 2)
const rate = 500

const noOp = () => { }
const clip = (min: number, max: number, value: number) => {
  if (value > max) return max
  if (value < min) return min
  return value
}

const lessExtreme = (x: number) => 0.8 * x + 0.1

class App extends Component {
  stroke?: Stroke
  pointInitializer?: PointInitializer
  colorInitializer?: ColorInitializer
  state: {
    trained: boolean
  }
  constructor(props: any) {
    super(props)
    this.state = {
      trained: false
    }
  }
  train = async () => {
    const trainingData = await BrowserPixelMatrix.load(brushwork2)
    const outputShape: [number, number] = [width, height]
    const diamondBias = await getDiamondBias(outputShape)
    const bias = (pixel: Pixel, point: Point) => {
      const b = diamondBias(pixel, point)
      // return eases.quadOut(b)
      // if (Math.random() > 0.01) console.log(b)
      return lessExtreme(b)
    }
    const sortPixels = sortPixelsByBrightness
    this.pointInitializer = initializeInCenter
    this.colorInitializer = initializeWithRandomColorFromTrainingData(trainingData)
    const markovPaint = await trainMarkovPaint(trainingData, noOp, sortPixels)
    const center = {
      x: Math.round(width / 2),
      y: Math.round(height / 2)
    }
    this.stroke = getGoldenSpiralStroke(markovPaint, rate, center)

    this.setState({ trained: true })
  }
  componentDidMount = () => {
    this.train()
  }
  render() {
    const divStyle: CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', position: 'relative' }
    if (!this.state.trained) {
      return <div style={divStyle}>
        <div style={{ width: width + 'px', height: height + 'px' }}>Training...</div>
      </div>
    }

    const canvas = (i: number) => <MarkovCanvas
      stroke={this.stroke!}
      pointInitializer={this.pointInitializer!}
      colorInitializer={this.colorInitializer!}
      delay={i * delayStepSize}
      width={width}
      height={height}
      padding={padding}
      zIndex={i} />

    return <div style={divStyle}>
      {canvas(1)}
    </div>
    // return <div style={divStyle}>
    //   <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}>
    //     {canvas(1)}
    //     {canvas(4)}
    //     {canvas(7)}
    //   </div>
    //   <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}>
    //     {canvas(2)}
    //     {canvas(5)}
    //     {canvas(8)}
    //   </div>
    //   <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}>
    //     {canvas(3)}
    //     {canvas(6)}
    //     {canvas(9)}
    //   </div>
    // </div >
  }
}

export default App
