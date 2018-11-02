"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const urlParser = require("url");
const micro = require("micro");
const NodeMarkovImageGenerator_1 = require("./NodeMarkovImageGenerator");
const NodePixelMatrix_1 = require("./NodePixelMatrix");
const reportProgress_1 = require("./reportProgress");
const createGenerator = async (trainingImageUrl) => {
    const trainingPixels = await NodePixelMatrix_1.default.load(trainingImageUrl);
    const generator = new NodeMarkovImageGenerator_1.default();
    generator.train(trainingPixels, reportProgress_1.default('Training'));
    return generator;
};
const getFirstIfArray = (x) => {
    if (Array.isArray(x)) {
        return x[0];
    }
    else {
        return x;
    }
};
const generatorPromises = {
    default: createGenerator('input-images/headlight-motion-blur.jpg')
};
exports.default = async (req, res) => {
    const url = urlParser.parse(req.url, true);
    const options = url.query;
    console.log({ options });
    const trainingImageUrl = getFirstIfArray(options['training-image']) || 'default';
    const generatorPromise = generatorPromises[trainingImageUrl] || createGenerator(trainingImageUrl);
    generatorPromises[trainingImageUrl] = generatorPromise;
    const generator = await generatorPromise;
    const pngStream = generator.generatePngStream([100, 100], reportProgress_1.default('Generating'));
    micro.send(res, 200, pngStream);
};
