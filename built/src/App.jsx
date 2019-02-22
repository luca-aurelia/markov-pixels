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
require("./App.css");
const MarkovCanvas_1 = __importDefault(require("./MarkovCanvas"));
const sc205799_no_border_jpg_1 = __importDefault(require("./images/Kawase Hasui/no border/sc205799 no border.jpg"));
class App extends react_1.Component {
    render() {
        const divStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' };
        const delayStepSize = 0;
        const width = 1000;
        const height = width;
        const padding = 10;
        const containerWidth = width + (padding * 2);
        const rate = 500;
        return <div style={divStyle}>
      
      
      <MarkovCanvas_1.default src={sc205799_no_border_jpg_1.default} trainingDataSrc={'src/images/Kawase Hasui/no border/sc205799 no border.jpg'} delay={4 * delayStepSize} width={width} height={height} padding={padding} rate={rate}/>
      
      
      
      
      
      
      
      
      
      
      
      
    </div>;
    }
}
exports.default = App;
