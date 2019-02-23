import React, { Component, CSSProperties } from 'react'
import './App.css'
import ToroidalBrowserPixelMatrix from './ToroidalBrowserPixelMatrix'
import MarkovImageGenerator from './MarkovImageGenerator'
import MarkovCanvas from './MarkovCanvas'
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

// const imageUrls = [a, b, c, d, e, f, g, h, i, j, k, l, m, n]
const imageUrls = [small]

class App extends Component {
  render() {
    const divStyle: CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', position: 'relative' }
    const delayStepSize = 0
    const width = 1000
    const height = 1000
    const padding = 10
    const containerWidth = width + (padding * 2)
    const rate = 500

    return <div style={divStyle}>
      {/* <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}> */}
      <MarkovCanvas sources={imageUrls} delay={1 * delayStepSize} width={width} height={height} padding={padding} rate={rate} zIndex={0} initializationAlgorithm={'initializeInCenter'} />
      {/* <MarkovCanvas sources={imageUrls} delay={2 * delayStepSize} width={width} height={height} padding={padding} rate={rate} zIndex={1} initializationAlgorithm={'initializeInTopRight'} />
      <MarkovCanvas sources={imageUrls} delay={2 * delayStepSize} width={width} height={height} padding={padding} rate={rate} zIndex={2} initializationAlgorithm={'initializeInBottomRight'} />
      <MarkovCanvas sources={imageUrls} delay={2 * delayStepSize} width={width} height={height} padding={padding} rate={rate} zIndex={3} initializationAlgorithm={'initializeInBottomLeft'} /> */}
      {/* <MarkovCanvas src={b} trainingDataSrc={'src/images/kawase/borderless/sc205799.jpg'} delay={4 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* <MarkovCanvas src={c} trainingDataSrc={'src/images/kawase/borderless/sc205802.jpg'} delay={7 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* </div> */}
      {/* <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}>
        <MarkovCanvas src={d} trainingDataSrc={'src/images/kawase/borderless/sc205804.jpg'} delay={2 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={e} trainingDataSrc={'src/images/kawase/borderless/sc205811.jpg'} delay={5 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={f} trainingDataSrc={'src/images/kawase/borderless/sc205814.jpg'} delay={8 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
      </div>
      <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}>
        <MarkovCanvas src={g} trainingDataSrc={'src/images/kawase/borderless/sc205815.jpg'} delay={3 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={h} trainingDataSrc={'src/images/kawase/borderless/sc205817.jpg'} delay={6 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={i} trainingDataSrc={'src/images/kawase/borderless/sc205834.jpg'} delay={9 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
      </div> */}
    </div >
  }
}

export default App
