"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PixelMatrix_1 = __importDefault(require("./PixelMatrix"));
const canvas_1 = require("canvas");
__export(require("./PixelMatrix"));
class BrowserPixelMatrix extends PixelMatrix_1.default {
    static fromPixelMatrix(pixelMatrix) {
        return new BrowserPixelMatrix(pixelMatrix.width, pixelMatrix.height, pixelMatrix.colorProfile, pixelMatrix.pixels);
    }
    static async load(imagePath) {
        const image = await canvas_1.loadImage(imagePath);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        return PixelMatrix_1.default.fromCanvas(canvas);
    }
    toCanvas() {
        const canvas = new HTMLCanvasElement();
        canvas.width = this.width;
        canvas.height = this.height;
        this.putPixels(canvas);
        return canvas;
    }
    toImageData() {
        return new ImageData(this.pixels, this.width, this.height);
    }
}
exports.default = BrowserPixelMatrix;
