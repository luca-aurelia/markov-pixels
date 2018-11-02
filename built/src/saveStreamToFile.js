"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const saveStreamToFile = (stream, path) => new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path);
    stream.pipe(writeStream);
    writeStream.on('finish', resolve);
});
exports.default = saveStreamToFile;
