"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const PixelMatrix_1 = require("./PixelMatrix");
const canvas_1 = require("canvas");
const saveStreamToFile_1 = require("./saveStreamToFile");
__export(require("./PixelMatrix"));
class NodePixelMatrix extends PixelMatrix_1.default {
    static fromPixelMatrix(pixelMatrix) {
        return new NodePixelMatrix(pixelMatrix.width, pixelMatrix.height, pixelMatrix.colorProfile, pixelMatrix.pixels);
    }
    static async load(imagePath) {
        const image = await canvas_1.loadImage(imagePath);
        const canvas = canvas_1.createCanvas(image.width, image.height);
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        return PixelMatrix_1.default.fromCanvas(canvas);
    }
    toImageData() {
        return canvas_1.createImageData(this.pixels, this.width, this.height);
    }
    toCanvas() {
        const canvas = canvas_1.createCanvas(this.width, this.height);
        this.putPixels(canvas);
        return canvas;
    }
    async saveAsPNG(outputPath) {
        const pixelStream = this.toCanvas().createPNGStream();
        await saveStreamToFile_1.default(pixelStream, outputPath);
    }
}
exports.default = NodePixelMatrix;
