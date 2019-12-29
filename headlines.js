// document.getElementById("Headline").innerHTML = "The headline of an article will go here";
// document.getElementById("Class").innerHTML = "The corresponding prediction will go here";
document.getElementById("Headline").style.display = "none"
document.getElementById("Class").style.display = "none"
// const API_KEY= process.env.API_KEY;

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
console.log(today)

//Load our model and USE model just once.
async function loadModel() {
    document.getElementById("Load").innerHTML = "Loading Tensorflow Model"
    let model = await tf.loadLayersModel('http://localhost:5000//news_model/model.json');
    console.log("model loaded")
    return model;
}
async function loadUse() {
    document.getElementById("Load").innerHTML = "Loading Embedding Model"
    let u = await use.load();
    console.log("use loaded")
    return u;
}

//Grab a bunch of headlines
const grabHeadlines = async (API_KEY, today) => {
    // query example: 'q= crypto AND (ethereum OR litecoin) NOT bitcoin&' +\
    var url = 'https://newsapi.org/v2/everything?' +
        'q= Entertainment OR Wellness OR Style OR Beauty OR Politics OR Travel OR Beaches OR Democrats OR Republicans' +
        'q= Tv OR Movies OR Makeup OR Cosmetics OR Clothes OR Green New Deal OR Mountains OR Trump OR Biden' +
        'from=' + today + '&' +
        'langauge=en' +
        'sortBy=publishedAt&' +
        'apiKey='+ API_KEY;
  var req = new Request(url);
  response = await fetch(req);
  result = await response.json();
  console.log(result)
    headlines = [];
    for (let i = 0; i < await result.articles.length; i++) {
        document.getElementById("Load").innerHTML = "Query Google News Headlines"
        headlines.push(await result.articles[i].title)
    }
    return headlines;
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
        document.getElementById("Load").innerHTML = "Encoding Text"
        encodedText.push(await encodeData(use, headlines[i]))
    }
    console.log('text encoded, feeding into model')
    return encodedText;
}

//make prediction
const predictions = async (text, model, threshold) => {
    var prediction = await model.predict(text).data();
    console.log(prediction);
    if (prediction[0] > threshold) {
        //document.getElementById("Class").innerHTML = "ENTERTAINMENT";
        console.log("This is Entertainment")
        return "ENTERTAINMENT";
    } else if (prediction[1] > threshold) {
        //document.getElementById("Class").innerHTML = "Politics";
        console.log("This is Politics")
        return "POLITICS";
    } else if (prediction[2] > threshold) {
        //document.getElementById("Class").innerHTML = "Wellness";
        console.log("This is wellness")
        return "WELLNESS";
    } else if (prediction[3] > threshold) {
        //document.getElementById("Class").innerHTML = "Travel";
        console.log("This is travel")
        return "TRAVEL";
    } else if (prediction[4] > threshold) {
        //document.getElementById("Class").innerHTML = "Style & Beauty";
        console.log("This is Style and Beauty")
        return "STYLE & BEAUTY";
    } else {
        console.log("No Prediction Confidence")
        return "No Confidence";
      }
}

//make each prediction seperately
const predictClasses = async (model, encodedText) => {
    classes = [];
    document.getElementById("Load").innerHTML = "Making Predictions"
    for (let i = 0; i < await encodedText.length; i++) {
        classes.push = await (`prediction: ${predictions(encodedText[i], model,.5)}`); // To make predictions top headlines
    }
    return classes;
}

//iterate through the predictions displaying each one after 10 seconds
const DisplayClassifier = async (i) => {
    document.getElementById("Load").style.display = "none"
    document.getElementById("Headline").style.display = "block"
    document.getElementById("Headline").innerHTML = await headlines[i]
    console.log(headlines[i])
    document.getElementById("Class").style.display = "block"
    document.getElementById("Class").innerHTML = await classes[i]
    console.log(classes[i])
}

const classifier = async (API_KEY) => {
    let model = await loadModel();
    let use = await loadUse();
    let headlines = await grabHeadlines(API_KEY, await today);
    let encodedText = await encodeAll(await use, await headlines)
    let classes = await predictClasses(await model, await encodedText);
    for (let i = 0; i < await classes.length; i++) {
        //setTimeout(DisplayClassifier(i), 10000);
        setTimeout(async function(){await DisplayClassifier(i)}, 3000);
    }
}

exports.classifier = classifier;

//classifier(API_KEY); 

// if (window.Worker) {
// 	const worker = new Worker("encoder.js");
//     // worker.addEventListener('message', function(e) {
//     //     console.log('Worker said: ', e.data);
//     //   }, false);
 
//     worker.postMessage([2,3]); // Send data to our worker.

//     worker.onmessage = function(e) {
// 		let result = e.data;
//         console.log('Message received from worker');
//         console.log(result);
// 	}
// } else {
// 	console.log('Your browser doesn\'t support web workers.')
// }


