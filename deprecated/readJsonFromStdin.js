const readStdin = () =>
  new Promise((resolve, reject) => {
    let data = ''
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    process.stdin.on('data', chunk => {
      data += chunk
    })

    process.stdin.on('end', () => {
      resolve(JSON.parse(data))
    })
  })

module.exports = readStdin
