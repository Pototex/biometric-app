const fs = require('fs')
const path = require('path')

const baseDir = path.resolve(__dirname, './output')

function saveFile(fileName, buf) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir)
  }
  fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}

function saveIncomingFile(base64Image, filename) {
  const base64Data = new Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  fs.writeFileSync(path.resolve(baseDir, filename), new Buffer.from(base64Data, 'base64'))
  
}

module.exports = { saveFile, saveIncomingFile }