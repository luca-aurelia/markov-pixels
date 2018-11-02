const sharp = require('sharp')
const fs = require('fs')

const fileNames = fs
  .readdirSync('./training-images')
  .filter(fileName => fileName.indexOf('.DS_Store') === -1)

const size = 100
const main = async () => {
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i]
    console.log({ fileName })
    const sharpImage = sharp('./training-images/' + fileName)
    const metadata = await sharpImage.metadata()
    let resized = null
    if (metadata.width > metadata.height) {
      resized = sharpImage.resize(size)
    } else {
      resized = sharpImage.resize(null, size)
    }
    await resized.toFile('./cleaned-training-images/' + fileName)
  }
}

main()
