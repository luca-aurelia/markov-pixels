"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RGBA = {
    channels: 4
};
exports.COLOR_PROFILES = {
    RGBA
};
const isEven = (n) => n % 2 === 0;
const EMPTY_PIXEL = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
};
const vonNeumannOffsets = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
];
const mooreOffsets = [];
for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) {
            continue;
        }
        mooreOffsets.push({ x, y });
    }
}
class PixelMatrix {
    constructor(width, height, colorProfile = RGBA, pixels) {
        this.width = width;
        this.height = height;
        this.colorProfile = colorProfile;
        const pixelsLength = width * height * colorProfile.channels;
        if (pixels === undefined) {
            pixels = new Uint8ClampedArray(pixelsLength);
        }
        else {
            if (pixelsLength !== pixels.length) {
                throw new Error(`Expected pixels to have length ${pixelsLength} (width * height * colorProfile.channels) but got ${pixels.length} instead.`);
            }
        }
        this.pixels = pixels;
    }
    static fromCanvas(canvas) {
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        return new PixelMatrix(canvas.width, canvas.height, exports.COLOR_PROFILES.RGBA, imageData.data);
    }
    get channels() {
        return this.colorProfile.channels;
    }
    get shape() {
        return [this.width, this.height];
    }
    get countPixels() {
        return this.width * this.height;
    }
    get(point) {
        if (!this.contains(point)) {
            throw new Error(`This pixel matrix doesn't contain the point ${point}.`);
        }
        const i = this.getIndex(point);
        let channels = [];
        for (let channelOffset = 0; channelOffset < 4; channelOffset++) {
            const channel = this.pixels[i + channelOffset];
            if (!channel)
                return EMPTY_PIXEL;
            channels.push(channel);
        }
        const [red, green, blue, alpha] = channels;
        return { red, green, blue, alpha };
    }
    getRandomPoint() {
        const x = Math.round(Math.random() * (this.width - 1));
        const y = Math.round(Math.random() * (this.height - 1));
        return { x, y };
    }
    getRandomPixel() {
        const randomPoint = this.getRandomPoint();
        return this.get(randomPoint);
    }
    getVonNeumannNeighboringPixels(point) {
        return this.getNeighboringPixels(point, vonNeumannOffsets);
    }
    getVonNeumannNeighboringPoints(point) {
        return this.getNeighbors(point, vonNeumannOffsets);
    }
    getMooreNeighboringPixels(point) {
        return this.getNeighboringPixels(point, mooreOffsets);
    }
    getMooreNeighboringPoints(point) {
        return this.getNeighbors(point, mooreOffsets);
    }
    getNeighboringPixels(point, neighborhood) {
        return this.getNeighbors(point, neighborhood).map(neighbor => this.get(neighbor));
    }
    getNeighbors(point, neighborhood) {
        const neighbors = [];
        neighborhood.forEach(offset => {
            const neighbor = {
                x: point.x + offset.x,
                y: point.y + offset.y
            };
            if (this.contains(neighbor)) {
                neighbors.push(neighbor);
            }
        });
        return neighbors;
    }
    set(point, pixel) {
        const { red, green, blue, alpha } = pixel;
        const i = this.getIndex(point);
        this.pixels[i] = red;
        this.pixels[i + 1] = green;
        this.pixels[i + 2] = blue;
        this.pixels[i + 3] = alpha;
    }
    randomDitherFrom(newMatrix, samples = 1000) {
        for (let _ = 0; _ < samples; _++) {
            const point = this.getRandomPoint();
            const newPixel = newMatrix.get(point);
            let p = newPixel;
            const darkeningFactor = 0;
            if (Math.random() > 0.5) {
                p = {
                    red: newPixel.red - darkeningFactor,
                    green: newPixel.green - darkeningFactor,
                    blue: newPixel.blue - darkeningFactor,
                    alpha: 255
                };
            }
            this.getVonNeumannNeighboringPoints(point).forEach(neighbor => {
                this.set(neighbor, p);
            });
        }
    }
    getIndex(point) {
        const { x, y } = point;
        if (!this.contains(point)) {
            throw new Error(`Expected x and y to be less than or equal to (${this.width}, ${this.height}) but was actually (${x}, ${y})`);
        }
        return y * (this.width * this.channels) + x * this.channels;
    }
    forEach(fn) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const point = Object.freeze({ x, y });
                const pixel = this.get(point);
                fn(pixel, point, this);
            }
        }
    }
    map(fn) {
        const newPixelMatrix = new PixelMatrix(this.width, this.height, this.colorProfile);
        this.forEach((pixel, point, pixelMatrix) => {
            const newPixel = fn(pixel, point, pixelMatrix);
            newPixelMatrix.set(point, newPixel);
        });
        return newPixelMatrix;
    }
    normalizedMap(fn) {
        return this.map((pixel, point, pixelMatrix) => {
            const normalizedPoint = {
                x: point.x / this.width,
                y: point.y / this.height
            };
            return fn(pixel, normalizedPoint, pixelMatrix);
        });
    }
    reduce(fn, startingValue) {
        let total = startingValue;
        this.forEach((pixel, point) => {
            total = fn(total, pixel, point);
        });
        return total;
    }
    getWindow(center, width, height) {
        if (isEven(width)) {
            throw new Error(`Expected an odd window width, but got ${width}`);
        }
        if (isEven(height)) {
            throw new Error(`Expected an odd window height, but got ${height}`);
        }
        const xRadius = (width - 1) / 2;
        const yRadius = (height - 1) / 2;
        const windowMatrix = new PixelMatrix(width, height, this.colorProfile);
        for (let yOffset = -yRadius; yOffset <= yRadius; yOffset++) {
            for (let xOffset = -xRadius; xOffset <= xRadius; xOffset++) {
                let x = center.x + xOffset;
                let y = center.y + yOffset;
                const point = { x, y };
                const pixel = this.contains(point) ? this.get(point) : EMPTY_PIXEL;
                const pointInWindow = { x: xOffset + xRadius, y: yOffset + yRadius };
                windowMatrix.set(pointInWindow, pixel);
            }
        }
        return windowMatrix;
    }
    contains(point) {
        return (point.x >= 0 &&
            point.x < this.width &&
            point.y >= 0 &&
            point.y < this.height);
    }
    toImageData() {
        return new ImageData(this.pixels, this.width, this.height);
    }
    putPixels(canvas) {
        if (canvas.width !== this.width || canvas.height !== this.height) {
            throw new Error(`Expected canvas shape and PixelMatrix shape to be the same, but canvas shape was [${canvas.width}, ${canvas.height}] and PixelMatrix shape was ${this.shape}.`);
        }
        const context = canvas.getContext('2d');
        context.putImageData(this.toImageData(), 0, 0);
    }
    getCenter() {
        const x = Math.floor(this.width / 2);
        const y = Math.floor(this.height / 2);
        return { x, y };
    }
}
exports.default = PixelMatrix;
