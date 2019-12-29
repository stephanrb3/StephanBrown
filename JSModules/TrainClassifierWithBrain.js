const fs = require('fs');
const brain = require('brain.js');
const network = new brain.recurrent.LSTM();

// create configuration for training
const config = {
  //layers: [10]
  hiddenLayers: [128,64], //Sets hidden layers
  activation: 'leaky-relu',  //Sets the function for activation
  iterations: 10, //The number of runs before  the neural net and then stop training
  learningRate: 0.001, //The multiplier for the backpropagation changes
  log: true,           // console.log() progress periodically 
  logPeriod: 2,       // number of iterations between logging 
  errorThresh: 0.05,  // error threshold tnpm o reach before completion
  reinforce:true, //keeps weights
};

// load Json
const news = fs.readFileSync('JSModules/data/News_Dataset.json');
let newsJson = JSON.parse(news);

let newsArray = [];

//class imbalance is no bueno, fix here 200 samples from 5 distinct categories
var e,p,c,t,s = 0;
for (let i = 1; i < newsJson.length; i++) {
  if(newsJson[i].category == "ENTERTAINMENT" || e <= 2010){ 
    newsArray.push({
      input: newsJson[i].headline,
      output: newsJson[i].category
    })
    e++;
  }
  if(newsJson[i].category == "POLITICS" || p <= 2010){
    newsArray.push({
        input: newsJson[i].headline,
        output: newsJson[i].category
    })
    p++;
  }

  //  {phrase: "Chocolate cake is the best", result: {good: 1}},
  // {input: 'How The Chinese Exclusion Act Can Help Us Understand Immigration Politics Today', output: '{POLITICS: 1}' },
  if(newsJson[i].category == "CRIME" || c <= 2010){
    newsArray.push({
      input: newsJson[i].headline,
      output: newsJson[i].category
    })
    c++;
  }
  if(newsJson[i].category == "TECH" || t <= 2010){
    newsArray.push({
      input: newsJson[i].headline,
      output: newsJson[i].category
    })
    t++;
  }
  if(newsJson[i].category == "SPORTS" || s <= 2010){
    newsArray.push({
      input: newsJson[i].headline,
      output: newsJson[i].category
    })
    s++;
  if(newsArray.length > 10050){
    break
    }
  }
}
console.log("train now")

console.log(newsArray)
//Train
var train = newsArray.slice(0, 10000); //We're just taking the first 1000 samples
network.train(train, 
  {

  }
  );

//This writes the nn to json
function saveFile(){
  fs.writeFile("network.json", JSON.stringify(network.toJSON()), function(err) {
      if(err)
          return console.log(err);
      console.log("The file was saved!");
  });
}


//this loads the nn from file and has code for testing
function loadFile(){    
  fs.readFile('network.json', function (err) {
      if (err)
          throw err; 
      var data = JSON.parse(fs.readFileSync('network.json', 'utf8'));
      var net = new brain.recurrent.LSTM();
      net.fromJSON(data);
      console.log("file loaded");
      
      //Test some samples
      var test = newsArray.slice(1000, 1050)
      for (let i = 0; i < test.length; i++) {
        var output = net.run(test);
        console.log(output);
      } 
  });
}

saveFile();
loadFile();



// create testing data
// const data = [
//   { input: "Trump is crazy", output: "Politics" },
//   { input: "Democrats pass new bill", output: "Politics" },
//   { input: "We got a green new deal", output: "Politics" },
//   { input: "Pelosi urges impeachment", output: "Politics" },
//   { input: "Impeachment procedures are going well", output: "Politics" },
//   { input: "Will the senate acquit trump", output: "Politics" },
//   { input: "House passes articles of impeachment", output: "Politics" },
//   { input: "Republicans in senate block impeachment", output: "Politics" },
//   { input: "Senate Democrats clash with house", output: "Politics" },
//   { input: "Donald trump vetos green new deal", output: "Politics" },

//   { input: "New movie on channel 1", output: "ENTERTAINMENT" },
//   { input: "HBO acquires new production", output: "ENTERTAINMENT" },
//   { input: "Celebrity gossip", output: "ENTERTAINMENT" },
//   { input: "Gossip girl gets renewed for new season", output: "ENTERTAINMENT" },
//   { input: "10/10 stars and perfect score on rotten tomatoes", output: "ENTERTAINMENT" },
//   { input: "Teen drama heats up summer", output: "ENTERTAINMENT" },
//   { input: "Jason Bateman stars in netflix comedy", output: "ENTERTAINMENT" },
//   { input: "Television starlet moves on to film", output: "ENTERTAINMENT" },
//   { input: "Production on Gossip Girl halted", output: "ENTERTAINMENT" },
//   { input: "Gossip girl was cancelled after production mishaps", output: "ENTERTAINMENT" },

//   { input: "Mass shooting kills 20 in texas", output: "CRIME" },
//   { input: "Stabbed mother of 2 leaves dying message", output: "CRIME" },
//   { input: "Shooting in el paso leaves many in fear", output: "CRIME" },
//   { input: "Terrorist attack leaves scarred nation", output: "CRIME" },
//   { input: "Drive by shooting from gang violence", output: "CRIME" },
//   { input: "Robbery of store leaves community shocked", output: "CRIME" },
//   { input: "Sexual assualt victims stands trial", output: "CRIME" },
//   { input: "Rapist avoids conviction", output: "CRIME" },
//   { input: "Sexaul assualt victim kills rapist", output: "CRIME" },
//   { input: "Mass Rape and Murder leave victims scarred", output: "CRIME" }
// ];



