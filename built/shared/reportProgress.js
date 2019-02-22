"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reportProgress = (verb) => {
    let previousPercent = -1;
    return (progress) => {
        const percent = Math.round(progress * 100);
        if (percent !== previousPercent) {
            previousPercent = percent;
            console.log(`${verb}... ${percent}%`);
        }
    };
};
exports.default = reportProgress;
