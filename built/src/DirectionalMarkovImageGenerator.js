"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const PixelMatrix_1 = require("./PixelMatrix");
const HiMarkov_1 = __importDefault(require("./HiMarkov"));
const array_shuffle_1 = __importDefault(require("array-shuffle"));
const MarkovImageGenerator_1 = __importStar(require("./MarkovImageGenerator"));
const trainNoOp = (progress) => { };
const getMooreNeighboringPointsWithOffsets = (pixelMatrix, point) => {
    const pointsWithOffsets = [];
    PixelMatrix_1.mooreOffsets.forEach(offset => {
        const neighboringPoint = {
            x: point.x + offset.x,
            y: point.y + offset.y
        };
        if (!pixelMatrix.contains(neighboringPoint)) {
            return;
        }
        pointsWithOffsets.push({
            offset,
            neighboringPoint
        });
    });
    if (!pointsWithOffsets.length) {
    }
    return pointsWithOffsets;
};
class DirectionalMarkovImageGenerator extends MarkovImageGenerator_1.default {
    constructor(trainingData) {
        super(trainingData);
        this.markovChains = [];
    }
    train(onProgress = trainNoOp) {
        // Dummy markov chain so that super class doesn't generate spurious errors
        this.markovChain = new HiMarkov_1.default(MarkovImageGenerator_1.pixelStateTransitionCodec);
        const numberOfMooreNeighbors = 8;
        // This slightly overestimates the number of state transitions since pixels on the
        // edge of the matrix don't actually have 8 Moore neighbors
        let totalStateTransitions = this.trainingData.countPixels * numberOfMooreNeighbors;
        let stateTransitionsRecorded = 0;
        this.trainingData.forEach((pixel, point) => {
            if (pixel.alpha === 255 && pixel.blue === 160 && pixel.green === 128 && pixel.red === 123) {
            }
            getMooreNeighboringPointsWithOffsets(this.trainingData, point).forEach(({ neighboringPoint, offset }) => {
                if (pixel.alpha === 255 && pixel.blue === 160 && pixel.green === 128 && pixel.red === 123) {
                }
                const neighboringPixel = this.trainingData.get(neighboringPoint);
                const stateTransition = [pixel, neighboringPixel];
                this.getMarkovChainFor(offset).recordStateTransition(stateTransition);
                stateTransitionsRecorded++;
                onProgress(stateTransitionsRecorded / totalStateTransitions);
            });
        });
    }
    getPixelsGenerator(outputShape, rate = 10, initializationAlgorithm = 'initializeInCenter', expansionAlgorithm = 'directionallyExpandPointsInRandomBlobs') {
        return super.getPixelsGenerator(outputShape, rate, initializationAlgorithm, expansionAlgorithm);
    }
    getMarkovChainFor(offset) {
        if (!this.markovChains[offset.x])
            this.markovChains[offset.x] = [];
        if (!this.markovChains[offset.x][offset.y]) {
            this.markovChains[offset.x][offset.y] = new HiMarkov_1.default(MarkovImageGenerator_1.pixelStateTransitionCodec);
        }
        return this.markovChains[offset.x][offset.y];
    }
    directionallyExpandPointsInRandomBlobs(expansionRate, pointsToExpandFrom, markovPixels) {
        const expand = (point) => {
            const color = markovPixels.get(point);
            const neighbors = getMooreNeighboringPointsWithOffsets(markovPixels, point);
            const shuffledNeighbors = array_shuffle_1.default(neighbors);
            shuffledNeighbors.forEach(({ neighboringPoint, offset }) => {
                const neighboringPixel = markovPixels.get(neighboringPoint);
                // console.log({ neighboringPixel })
                // if neighbor is already colored, don't change color
                if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha)
                    return;
                let neighborColor = this.getMarkovChainFor(offset).predict(color);
                if (!neighborColor)
                    throw new Error(`Prediction failed`);
                markovPixels.set(neighboringPoint, neighborColor);
                if (Math.random() > 0.5) {
                    pointsToExpandFrom.unshift(neighboringPoint);
                }
            });
        };
        let pointsExpanded = 0;
        for (let i = 0; i < expansionRate; i++) {
            const point = pointsToExpandFrom.pop();
            if (!point)
                break;
            expand(point);
            pointsExpanded++;
        }
        return pointsExpanded;
    }
    directionallyExpandPointsInRandomWalk(expansionRate, pointsToExpandFrom, markovPixels) {
        const expand = (point) => {
            const color = markovPixels.get(point);
            const neighbors = getMooreNeighboringPointsWithOffsets(markovPixels, point);
            const shuffledNeighbors = array_shuffle_1.default(neighbors);
            shuffledNeighbors.forEach(({ neighboringPoint, offset }) => {
                const neighboringPixel = markovPixels.get(neighboringPoint);
                // console.log({ neighboringPixel })
                // if neighbor is already colored, don't change color
                if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha)
                    return;
                let neighborColor = this.getMarkovChainFor(offset).predict(color);
                if (!neighborColor)
                    throw new Error(`Prediction failed`);
                markovPixels.set(neighboringPoint, neighborColor);
                if (Math.random() > 0.5) {
                    pointsToExpandFrom.unshift(neighboringPoint);
                }
                else {
                    pointsToExpandFrom.push(neighboringPoint);
                }
            });
        };
        let pointsExpanded = 0;
        for (let i = 0; i < expansionRate; i++) {
            const point = pointsToExpandFrom.pop();
            if (!point)
                break;
            expand(point);
            pointsExpanded++;
        }
        return pointsExpanded;
    }
    directionallyExpandPoints(expansionRate, pointsToExpandFrom, markovPixels) {
        const expand = (point) => {
            const color = markovPixels.get(point);
            const neighbors = getMooreNeighboringPointsWithOffsets(markovPixels, point);
            // const shuffledNeighbors = arrayShuffle(neighbors)
            neighbors.forEach(({ neighboringPoint, offset }) => {
                const neighboringPixel = markovPixels.get(neighboringPoint);
                // console.log({ neighboringPixel })
                // if neighbor is already colored, don't change color
                if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha)
                    return;
                let neighborColor = this.getMarkovChainFor(offset).predict(color);
                if (!neighborColor)
                    throw new Error(`Prediction failed`);
                markovPixels.set(neighboringPoint, neighborColor);
                pointsToExpandFrom.unshift(neighboringPoint);
            });
        };
        let pointsExpanded = 0;
        for (let i = 0; i < expansionRate; i++) {
            const point = pointsToExpandFrom.pop();
            if (!point)
                break;
            expand(point);
            pointsExpanded++;
        }
        return pointsExpanded;
    }
}
exports.default = DirectionalMarkovImageGenerator;
