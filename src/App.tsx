import React, { Component } from 'react'
import './App.css'
import ToroidalBrowserPixelMatrix from './ToroidalBrowserPixelMatrix'
import MarkovImageGenerator from './MarkovImageGenerator'
import DirectionalMarkovImageGenerator from './DirectionalMarkovImageGenerator'
import MarkovCanvas from './MarkovCanvas'
import a from './images/Kawase Hasui/no border/sc205798 no border.jpg'
import b from './images/Kawase Hasui/no border/sc205799 no border.jpg'
import c from './images/Kawase Hasui/no border/sc205802 no border.jpg'
import d from './images/Kawase Hasui/no border/sc205804 no border.jpg'
import e from './images/Kawase Hasui/no border/sc205811 no border.jpg'
import f from './images/Kawase Hasui/no border/sc205814 no border.jpg'
import g from './images/Kawase Hasui/no border/sc205815 no border.jpg'
import h from './images/Kawase Hasui/no border/sc205817 no border.jpg'
import i from './images/Kawase Hasui/no border/sc205834 no border.jpg'
import j from './images/Kawase Hasui/no border/sc205839 no border.jpg'
import k from './images/Kawase Hasui/no border/sc205842 no border.jpg'
import l from './images/Kawase Hasui/no border/sc205843 no border.jpg'
import m from './images/Kawase Hasui/no border/sc205845 no border.jpg'
import n from './images/Kawase Hasui/no border/sc205872 no border.jpg'

class App extends Component {
  render() {
    const divStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }
    const delayStepSize = 0
    const width = 1000
    const height = width
    const padding = 10
    const containerWidth = width + (padding * 2)
    const rate = 500

    return <div style={divStyle}>
      {/* <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}> */}
      {/* <MarkovCanvas src={a} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205798 no border.jpg'} delay={1 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* <MarkovCanvas src={b} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205799 no border.jpg'} delay={4 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      <MarkovCanvas src={c} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205802 no border.jpg'} delay={7 * delayStepSize} width={width} height={height} padding={padding} rate={rate} />
      <MarkovCanvas src={c} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205802 no border.jpg'} delay={7 * delayStepSize} width={width} height={height} padding={padding} rate={rate} array={true} />
      {/* </div> */}
      {/* <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}> */}
      {/* <MarkovCanvas src={d} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205804 no border.jpg'} delay={2 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* <MarkovCanvas src={e} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205811 no border.jpg'} delay={5 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* <MarkovCanvas src={f} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205814 no border.jpg'} delay={8 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* </div> */}
      {/* <div style={{ width: containerWidth + 'px', height: containerWidth * 3 + 'px' }}> */}
      {/* <MarkovCanvas src={g} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205815 no border.jpg'} delay={3 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* <MarkovCanvas src={h} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205817 no border.jpg'} delay={6 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* <MarkovCanvas src={i} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205834 no border.jpg'} delay={9 * delayStepSize} width={width} height={height} padding={padding} rate={rate} /> */}
      {/* </div> */}
    </div >
  }
}

export default App
