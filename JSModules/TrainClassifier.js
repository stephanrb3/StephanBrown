// const tf = require('tensorflow');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const argparse = require('argparse');
const use = require('@tensorflow-models/universal-sentence-encoder');

const N_CLASSES = 5;

// *********** Prep data **************//
// load Json
const news = fs.readFileSync('JSModules/data/News_Dataset.json');
let newsJson = JSON.parse(news);
let newsArray = []; 
//class imbalance is no bueno, fix here , take 9000 samples from 5 distinct categories
// POLITICS: 32739
// WELLNESS: 17827
// ENTERTAINMENT: 16058
// TRAVEL: 9887
// STYLE & BEAUTY: 9649
var e=0, p=0, w=0,t=0, s=0; //counters
for (let i = 0; i < newsJson.length; i++) {
  if(newsJson[i].category == "ENTERTAINMENT" && e <= 4000){ 
    newsArray.push({
      input: newsJson[i].headline,
      output: newsJson[i].category
    })
    e++;
    if(newsArray.length > 20000){
      break;
    }
  }
  else if(newsJson[i].category == "POLITICS" && p <= 4000){
    newsArray.push({
        input: newsJson[i].headline,
        output: newsJson[i].category
    })
    p++;
    if(newsArray.length > 20000){
      break;
    }
  }
  else if(newsJson[i].category == "WELLNESS" && w <= 4000){
    newsArray.push({
      input: newsJson[i].headline,
      output: newsJson[i].category
    })
    w++;
    if(newsArray.length > 20000){
      break;
    }
  }
  else if(newsJson[i].category == "STYLE & BEAUTY" && s <= 4000){
    newsArray.push({
      input: newsJson[i].headline,
      output: newsJson[i].category
    })
    s++;
    if(newsArray.length > 20000){
      break;
    }
  }
  else if(newsJson[i].category == "TRAVEL" && t <= 4000){
    newsArray.push({
      input: newsJson[i].headline,
      output: newsJson[i].category
    })
    t++;
    if(newsArray.length > 20000){
      break;
    }
  }

  else {
  }
}

const trainset = newsArray.slice(500,20000);
const testset = newsArray.slice(0,500);

// looks like { input: 'Rachel Dolezal Faces Felony Charges For Welfare Fraud', output: 'CRIME' }

const encodeData = async (data) => {
  const sentences = data.map(t => t.input);
  model = await use.load();
  const embeddings = await model.embed(sentences);
  console.log(embeddings)
  return embeddings;
};

const trainModel = async () => {
  var xTrain = await encodeData(trainset);
  const yTrain = tf.tensor2d(trainset.map(t => [
      t.output === "ENTERTAINMENT" ? 1 : 0,
      t.output === "POLITICS" ? 1 : 0,
      t.output === "WELLNESS" ? 1 : 0,
      t.output === "TRAVEL" ? 1 : 0, 
      t.output === "STYLE & BEAUTY" ? 1 : 0
    ])
   );

  //console.log(xTrain)
  // console.log(xTrain.shape)
  //console.log(yTrain)
  // console.log(yTrain.shape)

  const model = tf.sequential();
  console.log("Training new model");
  model.add(
    tf.layers.dense({inputShape: [512], activation: 'softmax', units: N_CLASSES}),
    tf.layers.dense({units: N_CLASSES, activation: 'relu'})
  );
  console.log("layers created")
  model.compile({loss: "categoricalCrossentropy", optimizer: 'adam', metrics: ["accuracy"] });
  console.log("compiler set")
  console.log("fitting now")
  await model.fit(xTrain, yTrain, {
    batchSize: 32,
    validationSplit: 0.1,
    shuffle: true,
    epochs: 100,
  });
  
  //model.save("JSModules/model");
  await model.save('file://./news_model');
  return model;
};

const predictions = async (threshold) => {
        //Test some samples
        let model = await trainModel()
        let texts = await encodeData(testset);
        console.log("done training, test now");
        //Batch predictions, no need for loop
        var prediction = await model.predict(texts).data();
        console.log(prediction);
        const tests = testset.map(t => t.output);
        var correct = 0;
        var j = 0;
        for (let i = 0; i < prediction.length; i+=N_CLASSES) {
          if (prediction[i] > threshold) {
            if(tests[j] === "ENTERTAINMENT") {correct++}
            console.log("This is Entertainment")
            //return "ENTERTAINMENT";
        } else if (prediction[i+1] > threshold) {
            if(tests[j] === "POLITICS") {correct++}
            console.log("This is Politics")
            //return "POLITICS";
        } else if (prediction[i+2] > threshold) {
            if(tests[j] === "WELLNESS") {correct++}
            console.log("This is wellness")
            //return "CRIME";
        } else if (prediction[i+3] > threshold) {
            if(tests[j] === "TRAVEL") {correct++}
            console.log("This is travel")
            //return "TECH";
        } else if (prediction[i+4] > threshold) {
            if(tests[j] === "STYLE & BEAUTY") {correct++}
            console.log("This is Style and Beauty")
            //return "SPORTS";
        } else {
            console.log("No Prediction Confidence")
            //return "No Confidence";
          }
          j++;
          console.log("accuracy is now: " + (correct/j))
        }
}

predictions(.5);