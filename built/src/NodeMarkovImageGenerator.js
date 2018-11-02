"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarkovImageGenerator_1 = require("./MarkovImageGenerator");
const NodePixelMatrix_1 = require("./NodePixelMatrix");
class NodeMarkovImageGenerator extends MarkovImageGenerator_1.default {
    generatePngStream(outputShape, onProgress) {
        const markovPixels = this.generatePixels(outputShape, onProgress);
        return NodePixelMatrix_1.default.fromPixelMatrix(markovPixels).toCanvas().createPNGStream();
    }
}
exports.default = NodeMarkovImageGenerator;
