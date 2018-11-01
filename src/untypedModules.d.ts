declare module 'canvas' {
  import { Readable } from 'stream'
  interface NodeCanvas extends HTMLCanvasElement {
    createPNGStream: () => Readable
  }
  export function loadImage(src: string): HTMLImageElement
  export function createCanvas(width: number, height: number): NodeCanvas
  export function createImageData(data: Uint8ClampedArray, width: number, height: number): ImageData
}