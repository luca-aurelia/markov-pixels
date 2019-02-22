"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BrowserPixelMatrix_1 = __importDefault(require("./BrowserPixelMatrix"));
class ToroidalBrowserPixelMatrix extends BrowserPixelMatrix_1.default {
    static fromPixelMatrix(pixelMatrix) {
        return new ToroidalBrowserPixelMatrix(pixelMatrix.width, pixelMatrix.height, pixelMatrix.colorProfile, pixelMatrix.pixels);
    }
    static async load(imagePath) {
        const pixelMatrix = await BrowserPixelMatrix_1.default.load(imagePath);
        return ToroidalBrowserPixelMatrix.fromPixelMatrix(pixelMatrix);
    }
    contains(point) {
        return true;
    }
    getIndex(point) {
        let { x, y } = point;
        x = x % this.width;
        y = y % this.height;
        return super.getIndex({ x, y });
    }
}
exports.default = ToroidalBrowserPixelMatrix;
