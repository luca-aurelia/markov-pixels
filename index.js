const urlParser = require('url')

module.exports = async (req, res) => {
  const url = urlParser.parse(req.url, true)
  const options = url.query
}
