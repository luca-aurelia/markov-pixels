'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const PixelMatrix_1 = __importDefault(require('./PixelMatrix'))
const canvas_1 = require('canvas')
const loadPixelMatrix = async imagePath => {
  const image = await canvas_1.loadImage(imagePath)
  const canvas = canvas_1.createCanvas(image.width, image.height)
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  return PixelMatrix_1.default.fromCanvas(canvas)
}
exports.default = loadPixelMatrix
