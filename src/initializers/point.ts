import PixelMatrix from '../PixelMatrix'

export const initializeInCenter = (markovPixels: PixelMatrix) => [markovPixels.getCenter()]

export const initializeInTopLeft = () => [{ x: 0, y: 0 }]

export const initializeInTopRight = (markovPixels: PixelMatrix) => [{ x: markovPixels.width - 1, y: 0 }]

export const initializeInBottomRight = (markovPixels: PixelMatrix) => [{ x: markovPixels.width - 1, y: markovPixels.height - 1 }]

export const initializeInBottomLeft = (markovPixels: PixelMatrix) => [{ x: 0, y: markovPixels.height - 1 }]

export const initializeRandomly = (markovPixels: PixelMatrix, countPoints: number) => {
  let points = []

  for (let i = 0; i < countPoints; i++) {
    points.push(markovPixels.getRandomPoint())
  }

  return points
}