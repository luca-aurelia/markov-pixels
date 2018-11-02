"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const getUnusedFilePath = (outputDirectory, fileName, extension) => {
    let i = 1;
    let suffix = '-' + i;
    let newFileName = fileName + suffix;
    let outputPath = path.join(outputDirectory, newFileName + extension);
    while (fs.existsSync(outputPath)) {
        i++;
        suffix = '-' + i;
        newFileName = fileName + suffix;
        outputPath = path.join(outputDirectory, newFileName + extension);
    }
    return outputPath;
};
exports.default = getUnusedFilePath;
