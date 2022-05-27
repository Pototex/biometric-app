const express = require('express')
const fileUpload = require('express-fileUpload')
const faceApiService = require('./faceapiService')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 3027

//middleware
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use('/out', express.static('output'))

app.post('/upload', async (req, res) => {
  const { base64Image, username } = req.body

  const filename = `${username}.jpeg`
  const baseDir = path.resolve(__dirname, './output')
  const base64Data = new Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  fs.writeFileSync(path.resolve(baseDir, filename), new Buffer.from(base64Data, 'base64'))
  
  const { result, recognize = {} } = await faceApiService.detect(filename)

  res.json({
    detectedFaces: result ? result.length : 0,
    url: `http://localhost:${port}/out/draw-detections-${filename}`,
    recognize,
  })
})

app.post('/login', async (req, res) => {
  const { base64Image, username } = req.body
  const filename = `${username}-login.jpeg`

  const baseDir = path.resolve(__dirname, './output')

  const base64Data = new Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  fs.writeFileSync(path.resolve(baseDir, filename), new Buffer.from(base64Data, 'base64'))

  const { result, recognize = {}, imgResults = [] } = await faceApiService.recognize(username, filename)

  res.json({
    detectedFaces: result ? result.length : 0,
    url: `http://localhost:${port}/out/draw-detections-${filename}`,
    recognize,
    imgResults,
  })
})

app.listen(port, () => {
  console.log(`Server start on port ${port}`)
})