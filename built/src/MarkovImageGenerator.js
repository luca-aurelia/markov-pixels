"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PixelMatrix_1 = require("./PixelMatrix");
const HiMarkov_1 = require("./HiMarkov");
const Deque = require("double-ended-queue");
const noOp = (progress) => { };
class MarkovImageGenerator {
    train(trainingData, onProgress = noOp) {
        this.trainingData = trainingData;
        const stateTransitions = [];
        this.markovChain = new HiMarkov_1.default(stateTransitions);
        const numberOfMooreNeighbors = 8;
        // This slightly overestimates the number of state transitions since pixels on the
        // edge of the matrix don't actually have 8 Moore neighbors
        let totalStateTransitions = this.trainingData.countPixels * numberOfMooreNeighbors;
        let stateTransitionsRecorded = 0;
        this.trainingData.forEach((pixel, point) => {
            this.trainingData.getMooreNeighboringPixels(point).forEach(neighbor => {
                const stateTransition = [pixel, neighbor];
                this.markovChain.recordStateTransition(stateTransition);
                stateTransitionsRecorded++;
                onProgress(stateTransitionsRecorded / totalStateTransitions);
            });
        });
    }
    generatePixels(outputShape, onProgress = noOp) {
        const [outputWidth, outputHeight] = outputShape;
        const markovPixels = new PixelMatrix_1.default(outputWidth, outputHeight);
        const pointsToExpandFrom = new Deque(this.trainingData.countPixels);
        const randomlyInitializeMarkovPixel = () => {
            const startingPoint = markovPixels.getRandomPoint();
            const startingColor = this.trainingData.getRandomPixel();
            markovPixels.set(startingPoint, startingColor);
            pointsToExpandFrom.push(startingPoint);
        };
        for (let i = 0; i < 3; i++) {
            randomlyInitializeMarkovPixel();
        }
        let pixelsGenerated = 0;
        console.log('Generating image.');
        while (pointsToExpandFrom.length > 0) {
            const point = pointsToExpandFrom.pop();
            const color = markovPixels.get(point);
            const neighbors = markovPixels.getMooreNeighboringPoints(point);
            neighbors.forEach(neighbor => {
                const neighboringPixel = markovPixels.get(neighbor);
                // if neighbor is already colored, don't change color
                if (neighboringPixel.red || neighboringPixel.green || neighboringPixel.blue || neighboringPixel.alpha)
                    return;
                const neighborColor = this.markovChain.predict(color);
                markovPixels.set(neighbor, neighborColor);
                pointsToExpandFrom.unshift(neighbor);
                pixelsGenerated++;
                const progress = pixelsGenerated / markovPixels.countPixels;
                onProgress(progress);
            });
        }
        return markovPixels;
    }
}
exports.default = MarkovImageGenerator;
