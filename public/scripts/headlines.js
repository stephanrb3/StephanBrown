const socket = io();
var loader = document.getElementById("loader");
var load = document.getElementById("Load");
var title = document.getElementById("Headline")
var pred = document.getElementById("Class")

title.style.display = "none"
pred.style.display = "none"

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;

//well use this to wait to change display
async function wait() {
	return new Promise(function(resolve) {
  	setTimeout(resolve, 7000);
  });
}

//well use this to wait to change display
async function wait2() {
	return new Promise(function(resolve) {
  	setTimeout(resolve, 1000);
  });
}

//Grab a bunch of headlines
const grabHeadlines = async (API_KEY, today) => {
    // query example: 'q= crypto AND (ethereum OR litecoin) NOT bitcoin&' +\
    //idk why top headlines produces an api key error, so we're just gonna query todays headlines by popularity
    var url = //'https://newsapi.org/v2/top-headlines?' +                        
        'https://newsapi.org/v2/everything?' +
        'q= Entertainment OR Wellness OR Style OR Beauty OR Politics OR Travel OR Beaches OR Democrats OR Republicans' +
        'q= Tv OR Movies OR Makeup OR Cosmetics OR Clothes OR Green New Deal OR Mountains OR Trump OR Biden' +
        'q= health OR skincare OR yoga OR film OR cinema OR law OR party OR forests OR hotel' +
        'q= city OR mayor OR governor OR senator OR starlet OR box office OR book OR flight OR cruise' +
        'from=' + today + '&' +
        'langauge=en' +
        'sortBy=popularity&' +
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

//iterate through the predictions displaying each one after 10 seconds
const DisplayClassifier = async (classes, headlines) => {
    for (let i = 1; i < classes.length; i++) {
        await wait();
        $('.MLbox').toggleClass('hide');
        console.log("hidden")
        await wait2();
        title.innerHTML = await headlines[i];
        pred.innerHTML = await classes[i];
        $('.MLbox').toggleClass('hide');
        $('#fade-in').toggleClass('show');
        console.log("shown")
    }
    DisplayClassifier(classes, headlines);
}
const threshold = .4;
const classifier = async (API_KEY) => {
    let headlines = await grabHeadlines(API_KEY, await today);
    socket.emit("Encoding", headlines); 
    load.innerHTML = "Making Predictions"
    let classes = []
    socket.on("Prediction", async(prediction)=>{
        if (prediction[0] > threshold) {
            // console.log("This is Entertainment")
            classes.push("Entertainment")
        } else if (prediction[1] > threshold) {
            // console.log("This is Politics")
            classes.push("Politics")
        } else if (prediction[2] > threshold) {
            // console.log("This is wellness")
            classes.push("Wellness")
        } else if (prediction[3] > threshold) {
            // console.log("This is travel")
            classes.push("Travel")
        } else if (prediction[4] > threshold) {
            // console.log("This is Style and Beauty")
            classes.push("Style and Beauty")
        } else {
            // console.log("No Prediction Confidence")
            classes.push("Sorry, this one is a bit too murky for my model")
          }
        //start displaying when there's at least 1 prediction
        if(classes.length == headlines.length){
            loader.style.display = "none";
            load.style.display = "none";
            pred.innerHTML = await classes[0];
            title.innerHTML = await headlines[0];
            title.style.display = "block";
            pred.style.display = "block";
            $('.MLbox').toggleClass('show');
            DisplayClassifier(classes, headlines);  
        }
    })
}

socket.on('Key', (API_KEY) => {
    classifier(API_KEY); 
})

// var box = document.getElementsByClassName("MLbox")
// var boxOne = document.getElementsByClassName('MLbox')[0]