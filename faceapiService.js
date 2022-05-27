const path = require('path')
const tf = require('@tensorflow/tfjs-node')
const canvas = require("canvas")
const save = require('./saveFile')
const fs = require('fs')
const Crypto = require('crypto')

const faceapi = require('@vladmandic/face-api/dist/face-api.node.js')
const modelPathRoot = './models'

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

let optionsSSDMobileNet

async function image(file) {
  const decoded = tf.node.decodeImage(file)
  const casted = decoded.toFloat()
  const result = casted.expandDims(0)
  decoded.dispose()
  casted.dispose()
  return result
}

async function detect(tensor) {
  const result = await faceapi.detectAllFaces(tensor, optionsSSDMobileNet)
  .withFaceLandmarks(optionsSSDMobileNet)
    .withFaceExpressions()
  console.log(result)
  return result
}

async function recognize(tensor, username) {
  const imageBuffer = fs.readFileSync(`./output/${username}.jpeg`)
  const tensorLogin = await image(imageBuffer)

  const loginDescriptors = await getFaceDescriptors(tensorLogin)
  const tensorDescriptors = await getFaceDescriptors(tensor)

  console.log(loginDescriptors, tensorDescriptors)

  const result = faceapi.euclideanDistance(loginDescriptors.descriptor, tensorDescriptors.descriptor)
  console.log(result)
    
  return result
}

async function getFaceDescriptors(input) {
  return faceapi
    .detectSingleFace(input, optionsSSDMobileNet)
    .withFaceLandmarks(optionsSSDMobileNet)
    .withFaceExpressions()
    .withFaceDescriptor()
}

async function setUpFaceApi() {
  console.log("FaceAPI single-process test")

  //setup faceapi
  await faceapi.tf.setBackend("tensorflow")
  await faceapi.tf.enableProdMode()
  await faceapi.tf.ENV.set("DEBUG", false)
  await faceapi.tf.ready()

  console.log(
    `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
      faceapi.version
    } Backend: ${faceapi.tf?.getBackend()}`
  )

  console.log("Loading FaceAPI models")
  const modelPath = path.join(__dirname, modelPathRoot)
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
  optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
  })
  
  await Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
    faceapi.nets.faceLandmark68TinyNet.loadFromDisk(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
    faceapi.nets.faceExpressionNet.loadFromDisk(modelPath),
  ])
}


async function detectFaces(filename) {
  try {
    await setUpFaceApi()

    const imageBuffer = fs.readFileSync(`./output/${filename}`)
    const tensor = await image(imageBuffer)

    const result = await detect(tensor)

    if (result && result.length > 0) {
      console.log("Detected faces: ", result ? result.length : 0) 
      await drawDetections(filename, imageBuffer, result)
    }

    tensor.dispose()

    return {result}
  } catch(error) {
    console.error(error)
  }
}

async function recognizeFaces(username, filename) {
  try {
    await setUpFaceApi()

    const imageBuffer = fs.readFileSync(`./output/${filename}`)
    const tensor = await image(imageBuffer)

    const result = await detect(tensor)
    console.log("Detected faces: ", result ? result.length : 0)

    let equal = 1
    let imgResults = []

    if (result && result.length > 0 ) {
      equal = await recognize(tensor, username)    
      console.log("Same person: ", equal)
      imgResults = await drawDetections(filename, imageBuffer, result)
    }

    tensor.dispose()

    return {result, recognize: equal, imgResults}
  } catch(error) {
    console.error(error)
  }
}

async function drawDetections(filename, imageBuffer, result) {
  const imgResults = [
    { title: 'Detección Rostro',
      image: `draw-detections-${randomString(8)}-${filename}`},
    {
      title: 'Detección Rostro & Face Landmarks',
      image: `draw-detections-${randomString(8)}-${filename}`},
    {
      title: 'Detección Rostro & Face Landmarks & Face Expressions',
      image: `draw-detections-${randomString(8)}-${filename}`},
  ]
  const canvasImg = await canvas.loadImage(imageBuffer);
  const out = await faceapi.createCanvasFromMedia(canvasImg);
  faceapi.draw.drawDetections(out, result);
  save.saveFile(imgResults[0].image, out.toBuffer("image/jpeg"))
  faceapi.draw.drawFaceLandmarks(out, result);
  save.saveFile(imgResults[1].image, out.toBuffer("image/jpeg"))
  faceapi.draw.drawFaceExpressions(out, result);
  save.saveFile(imgResults[2].image, out.toBuffer("image/jpeg"))
  console.log(`done, saved results to draw-detections-${filename}`)
  return imgResults
}

function randomString(size = 21) {  
  return Crypto
    .randomBytes(size)
    .toString('hex')
    .slice(0, size)
}

module.exports = { 
  detect: detectFaces, 
  recognize: recognizeFaces 
}