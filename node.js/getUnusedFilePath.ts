import * as path from 'path'
import * as fs from 'fs'

const getUnusedFilePath = (outputDirectory: string, fileName: string, extension: string): string => {
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

export default getUnusedFilePath
