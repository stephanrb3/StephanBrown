const path = require('path')
const http = require('http');
const express = require('express')
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server)
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');
const PORT = process.env.PORT || 5000
//////////////////////////////////////////////////////////////////////


/////////////// Inference Functions//////////////////////////////////
//Load our model and USE model just once.
async function loadModel() {
  const modelURL = `https://stephanrbrown.herokuapp.com/news_model/model.json`;
  const model = await tf.loadLayersModel(modelURL);
  console.log("model loaded")
  return model;
}
async function loadUse() {
  let u = await use.load();
  console.log("use loaded")
  return u;
}

//encode each
const encodeData = async (model,data) => {
  var embeddings = await model.embed(data);
  console.log(embeddings)
  return embeddings;
};

//encode all
async function encodeAll(use, headlines) {
  //encode each headline into an array of embeddings
  encodedText = []
  for (let i = 0; i < await headlines.length; i++) {
      encodedText.push(await encodeData(use, headlines[i]))
  }
  console.log('text encoded, feeding into model')
  return encodedText;
}
//make prediction
const predictions = async (text, model, threshold) => {
  var prediction = await model.predict(await text).data();
  socket.emit("Prediction", prediction)
}

//make each prediction seperately
const predictClasses = async (model, encodedText) => {
  classes = [];
  for (let i = 0; i < await encodedText.length; i++) {
      classes.push = await predictions(encodedText[i], model,.5); // To make predictions top headlines
      console.log(classes)
  }
  return classes;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////// Run App and Web Sockets ///////////////////////////////
app.use(express.static(path.join(__dirname, 'public')))
const API_KEY= process.env.API_KEY;
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/home'))

io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(API_KEY)
  socket.emit("Key", API_KEY)
  socket.on("Encoding", async(headlines) => {
    let model = await loadModel();
    let use = await loadUse();
    console.log("beginning encoding")
    let encodedText = await encodeAll(await use, await headlines)
    console.log("encoded headlines");
    for (let i = 0; i < await encodedText.length; i++) {
      var prediction = await model.predict(await encodedText[i]).data();
      //console.log(await prediction);
      socket.emit("Prediction", prediction)
    }
  })
});
server.listen(PORT, () => console.log("Server started!", `Listening on ${ PORT }`));
////////////////////////////////////////////////////////////////////////////////////////////




