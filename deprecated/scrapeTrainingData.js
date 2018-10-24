const Scraper = require('images-scraper')
const google = new Scraper.Google()
const download = require('image-downloader')
const CliProgress = require('cli-progress')

const main = async () => {
  const imageCount = 100
  const results = await google.list({
    keyword: 'hyper light drifter screenshot',
    num: imageCount,
    detail: true,
    nightmare: {
      show: true
    }
  })
  const progressBar = new CliProgress.Bar()
  progressBar.start(results.length, 0)
  const promises = []
  let imagesDownloaded = 0
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const promise = download
      .image({
        url: result.url,
        dest: './training-images'
      })
      .then(() => {
        imagesDownloaded++
        progressBar.update(imagesDownloaded)
      })
    promises.push(promise)
  }
  await Promise.all(promises)
  progressBar.stop()
}

main()
