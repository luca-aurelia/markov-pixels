"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const urlParser = __importStar(require("url"));
const micro = __importStar(require("micro"));
const MarkovImageGenerator_1 = require("./MarkovImageGenerator");
const loadPixelMatrix_1 = __importDefault(require("./loadPixelMatrix"));
const reportProgress_1 = __importDefault(require("../shared/reportProgress"));
const fs_1 = __importDefault(require("fs"));
const trainOnUrl = async (trainingImageUrl) => {
    const trainingPixels = await loadPixelMatrix_1.default(trainingImageUrl);
    const markovChain = MarkovImageGenerator_1.train(trainingPixels, reportProgress_1.default('Training'));
    return markovChain.transitionCounts;
};
const getFirstIfArray = (x) => {
    if (Array.isArray(x)) {
        return x[0];
    }
    else {
        return x;
    }
};
const transitionCountPromisesByUrl = {};
exports.default = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    const url = urlParser.parse(req.url, true);
    const options = url.query;
    const trainingImageUrl = getFirstIfArray(options['training-image']);
    const fileName = `./src/transitionCounts/${trainingImageUrl.replace(/\//g, '-')}.json`;
    if (fs_1.default.existsSync(fileName)) {
        const transitionCounts = await fs_1.default.promises.readFile(fileName);
        micro.send(res, 200, transitionCounts);
    }
    else {
        const transitionCounts = JSON.stringify(await trainOnUrl(trainingImageUrl));
        await fs_1.default.promises.writeFile(fileName, transitionCounts);
        micro.send(res, 200, transitionCounts);
    }
};
