const video = document.getElementById('video')

// loads all asynchronous calls in parallel to make it quicker to execute
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  // register different parts of the face
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  // locate the face, the box around it
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  // recognise if I'm frowning, smiling, happy, sad, angry..
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)
// .then calls the apis first and then calls the funcion after the models are loaded

// function to get the user video, the webcam stream goes into the source object to the video id
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream, 
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    // funtion to draw expressions
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})