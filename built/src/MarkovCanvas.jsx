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
const react_1 = __importStar(require("react"));
const MarkovImageGenerator_1 = __importDefault(require("./MarkovImageGenerator"));
const BrowserPixelMatrix_1 = __importDefault(require("./BrowserPixelMatrix"));
class MarkovCanvas extends react_1.Component {
    constructor(props) {
        super(props);
        this.receiveRef = async (canvas) => {
            this.canvas = canvas;
            this.canvas.width = this.props.width;
            this.canvas.height = this.props.height;
            setTimeout(this.generatePixels, this.props.delay);
        };
        this.onTrainingProgress = () => {
        };
        this.componentDidMount = async () => {
            // const markovChain = new HiMarkov(pixelStateTransitionCodec)
            const trainingData = await BrowserPixelMatrix_1.default.load(this.props.src);
            // const transitionCounts = await window.fetch(`http://localhost:3001/?training-image=${this.props.trainingDataSrc}`).then(response => response.json())
            // markovChain.transitionCounts = transitionCounts
            this.generator = new MarkovImageGenerator_1.default(trainingData);
            this.generator.train();
            this.setState({ trained: true }, () => this.generatePixels());
        };
        this.generatePixels = () => {
            if (!this.generator)
                throw new Error('Can\'t generate pixels without generator');
            const generatePixels = this.generator.getPixelsGenerator([this.props.width, this.props.height], this.props.rate, 'initializeInCenter', 'expandPoints');
            const iterate = () => {
                const generated = generatePixels();
                if (generated.progress < 1) {
                    window.requestAnimationFrame(iterate);
                }
                if (!this.canvas)
                    throw new Error('Can\'t generate pixels without canvas');
                generated.pixels.putPixels(this.canvas);
            };
            iterate();
        };
        this.props = props;
        this.state = {
            trained: false
        };
    }
    render() {
        if (this.state.trained) {
            return <canvas ref={this.receiveRef} onClick={this.generatePixels} style={{ width: this.props.width + 'px', height: this.props.height + 'px', imageRendering: 'pixelated', padding: this.props.padding + 'px' }}/>;
        }
        else {
            return <div style={{ width: this.props.width + 'px', height: this.props.height + 'px' }}>Training...</div>;
        }
    }
}
exports.default = MarkovCanvas;
