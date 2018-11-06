import React, { Component } from 'react'
import './App.css'
import ToroidalBrowserPixelMatrix from './ToroidalBrowserPixelMatrix'
import MarkovImageGenerator from './MarkovImageGenerator'
import DirectionalMarkovImageGenerator from './DirectionalMarkovImageGenerator'
import MarkovCanvas from './MarkovCanvas'
import a from './images/Kawase Hasui/no border/small/sc205798 no border small.jpg'
import b from './images/Kawase Hasui/no border/small/sc205799 no border small.jpg'
import c from './images/Kawase Hasui/no border/small/sc205802 no border small.jpg'
import d from './images/Kawase Hasui/no border/small/sc205804 no border small.jpg'
import e from './images/Kawase Hasui/no border/small/sc205811 no border small.jpg'
import f from './images/Kawase Hasui/no border/small/sc205814 no border small.jpg'
import g from './images/Kawase Hasui/no border/small/sc205815 no border small.jpg'
import h from './images/Kawase Hasui/no border/small/sc205817 no border small.jpg'
import i from './images/Kawase Hasui/no border/small/sc205834 no border small.jpg'
import j from './images/Kawase Hasui/no border/small/sc205839 no border small.jpg'
import k from './images/Kawase Hasui/no border/small/sc205842 no border small.jpg'
import l from './images/Kawase Hasui/no border/small/sc205843 no border small.jpg'
import m from './images/Kawase Hasui/no border/small/sc205845 no border small.jpg'
import n from './images/Kawase Hasui/no border/small/sc205872 no border small.jpg'

class App extends Component {
  render() {
    const divStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }
    const delayStepSize = 0
    const width = 250
    const height = width
    const padding = 10
    const containerWidth = width + (padding * 2)
    const rate = 150

    return <div style={divStyle}>
      <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}>
        <MarkovCanvas src={a} delay={1 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={b} delay={4 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={c} delay={7 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
      </div>
      <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}>
        <MarkovCanvas src={d} delay={2 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={e} delay={5 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={f} delay={8 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
      </div>
      <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}>
        <MarkovCanvas src={g} delay={3 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={h} delay={6 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
        <MarkovCanvas src={i} delay={9 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
      </div>
    </div >
  }
}

export default App
