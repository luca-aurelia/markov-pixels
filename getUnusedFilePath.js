const path = require('path')
const fs = require('fs')

const getUnusedFileName = (outputDirectory, fileName, extension) => {
  let i = 1
  let suffix = '-' + i
  let newFileName = fileName + suffix
  let outputPath = path.join(outputDirectory, newFileName + extension)

  while (fs.existsSync(outputPath)) {
    i++
    suffix = '-' + i
    newFileName = fileName + suffix
    outputPath = path.join(outputDirectory, newFileName + extension)
  }

  return outputPath
}

module.exports = getUnusedFileName
