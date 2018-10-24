const fsPromise = require('fs').promises
const globby = require('globby')
const ProgressPromise = require('p-progress')

const flattenIfArray = x => (Array.isArray(x) ? [].concat(...x) : x)

const asyncMapFiles = (asyncMapper, inputGlob) =>
  new ProgressPromise(async (resolve, reject, progress) => {
    const matches = await globby(inputGlob)

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const result = await asyncMapper(match)

      if (!result) {
        progress(i / matches.length)
        continue
      }

      if (!result.data || !result.path) {
        throw new Error(
          'Mapper must return undefined or an object with data and path properties.'
        )
      }

      const data = flattenIfArray(result.data)
      await fsPromise.writeFile(result.path, data)
      progress(i / matches.length)
    }
    resolve()
  })

module.exports = asyncMapFiles
