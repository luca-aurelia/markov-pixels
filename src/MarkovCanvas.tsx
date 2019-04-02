import React, { Component, CSSProperties } from 'react'
import getImageGenerator, { PixelsGenerator } from './getImageGenerator'
import PixelMatrix from './PixelMatrix'
import arrayShuffle from 'array-shuffle';
import { Stroke } from './strokes/types'
import { PointInitializer, ColorInitializer } from './initializers/types';

interface MarkovCanvasProps {
  delay: number,
  width: number,
  height: number,
  padding: number,
  zIndex: number,
  stroke: Stroke,
  pointInitializer: PointInitializer,
  colorInitializer: ColorInitializer
}

class MarkovCanvas extends Component {
  props: MarkovCanvasProps
  canvas: HTMLCanvasElement | undefined
  trainingData?: PixelMatrix
  generator?: PixelsGenerator
  constructor(props: MarkovCanvasProps) {
    super(props)
    this.props = props
  }
  receiveRef = async (canvas: HTMLCanvasElement) => {
    this.canvas = canvas
    this.canvas.width = this.props.width
    this.canvas.height = this.props.height

    const outputShape: [number, number] = [this.props.width, this.props.height]
    this.generator = getImageGenerator(outputShape, this.props.pointInitializer, this.props.colorInitializer, this.props.stroke)

    setTimeout(this.generatePixels, this.props.delay)
  }
  generatePixels = async () => {
    const iterate = () => {
      if (!this.generator) throw new Error('Can\'t generate pixels without generator')
      const generated = this.generator()
      if (!generated.finished) {
        window.requestAnimationFrame(iterate)
      }

      if (!this.canvas) throw new Error('Can\'t generate pixels without canvas')
      generated.pixels.putPixels(this.canvas)
    }

    iterate()
  }
  render() {
    // const style: CSSProperties = {
    //   width: this.props.width + 'px',
    //   height: this.props.height + 'px',
    //   imageRendering: 'pixelated',
    //   padding: this.props.padding + 'px',
    //   position: 'relative',
    //   left: 0,
    //   top: 0,
    //   zIndex: this.props.zIndex
    // }

    const style: CSSProperties = {
      height: '90%',
      imageRendering: 'pixelated',
      padding: this.props.padding + 'px',
      position: 'relative',
      left: 0,
      top: 0,
      zIndex: this.props.zIndex
    }

    return <canvas ref={this.receiveRef} onClick={this.generatePixels} style={style} />
    // return <div style={{ width: this.props.width + 'px', height: this.props.height + 'px' }}>Training...</div>
  }
}

export default MarkovCanvas
