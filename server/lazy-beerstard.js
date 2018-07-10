const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs')
const AWS = require('aws-sdk')
const stringSimilarity = require('string-similarity')
const imageDataUri = require('image-data-uri')
const _ = require('lodash')
const cheerio = require('cheerio')
const request = require('request')
// const multer = require('multer')
const mapGenerator = require('./map-generator.js')

console.log('----- Lazy Beerstard app init')

app.use(express.static('test-images')) // Purely for show and tell test

// const storage = multer.memoryStorage()
// const upload = multer({ storage })

const AWS_REGION = process.env.LAZY_BEERSTARD_AWS_REGION
const AWS_ACCESS = process.env.LAZY_BEERSTARD_AWS_ACCESS
const AWS_SECRET = process.env.LAZY_BEERSTARD_AWS_SECRET
const PORT = process.env.LAZY_BEERSTARD_PORT

function checkEnvVars () {
  console.log('AWS_REGION', AWS_REGION)
  console.log('AWS_ACCESS', AWS_ACCESS)
  console.log('AWS_SECRET', AWS_SECRET)
  console.log('PORT', PORT)
  if (AWS_REGION === undefined || AWS_ACCESS === undefined || AWS_SECRET === undefined || PORT === undefined) {
    console.error('Environment variables not set correctly')
    process.exit(1)
  }
}
checkEnvVars()

var beerList
var beerListNames = []
var beerListFlat = []
loadBeerData()

var rekognition = new AWS.Rekognition({region: AWS_REGION, accessKeyId: AWS_ACCESS, secretAccessKey: AWS_SECRET})
// var rekognition = new AWS.Rekognition({
//   region: AWS_REGION
// })

app.use(bodyParser.json({
  limit: '50mb'
}))
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}))

// Cross domain at some point?
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', ['*'])
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/', (req, res) => res.send('Hello lazy beerstard root!'))

app.get('/get', (req, res) => {
  console.log('get test', req.body, req.params)
  return res.send('Hello lazy beerstard root!')
})

app.post('/detect-calories-beer', async function (req, res) {
  console.log('Incoming calories request') //, req.body)
  // TODO Validate request fields

  var height = req.body.height
  var weight = req.body.weight
  // console.log('imageData', req.body)
  var rawImg = req.body.imageData.replace(/(?:\r\n|\r|\n)/g, '')

  var img = imageDataUri.decode(rawImg).dataBuffer
  // console.log('req.body.imageData', rawImg, img)

  var result = await processCaloriesRequest(img, height, weight)

  res.json(result)
})

app.get('/map-data', async function (req, res) {
  console.log('Incoming map request')
  var lat = Number(req.query.lat)
  var lng = Number(req.query.lng)
  var distance = Number(req.query.distance)
  console.log('data', lat, lng, distance)
  var map = await mapGenerator.generateMap({lat: lat, lng: lng}, distance)
  console.log('map', map)
  res.json(map)
})

async function processCaloriesRequest (img, height, weight) {
  return new Promise(async resolve => {
    var result = await detectText(img)
    console.log('ocrResult', result)

    // Add weight and result
    result.height = height
    result.weight = weight

    // Get calories for name
    var caloriesResult = await detectCaloriesFromName(result)
    result.calories = caloriesResult.calories
    result.name = caloriesResult.name
    console.log('calories result', caloriesResult)
    if (caloriesResult.calories === undefined) {
      result.error = 'Unable to find how many calories'
    }

    // Get distance required to walk
    var distance = await calculateDistanceToBeWalked(result)
    result.distance = distance
    console.log('distance', result.name, distance)
    // Mobile app should be responsible for calculating and drawing route

    resolve(result)
  })
}

function calculateDistanceToBeWalked (result) {
  return new Promise(resolve => {
    // Calories burned per minute = (0.035 * body weight in kg) + ((Velocity in m/s ^ 2) / Height in m)) * (0.029) * (body weight in kg)
    // velocity - 1.4 m per second, squared = 1.96
    // height in m
    var c1 = 0.035 * result.weight
    // console.log('0.035 x 60 = 2.1', 0.035, result.weight, c1)

    var c2 = 1.96 / result.height
    // console.log('1.96 ÷ 1.6 = 1.225', 1.96, result.height, c2)

    var calPerMin = (c1 + c2) * 0.029 * 60
    // console.log('(2.1) + (1.225) * (0.029) * (60)', c1, c2, 0.029, 60, calPerMin)

    var walkingTime = result.calories / calPerMin
    console.log('walkingTime', walkingTime)

    // (1.6 * 60) // distance in 1 minute
    var distanceMetres = (1.4 * 60) * walkingTime
    console.log('distanceMetres', distanceMetres)
    var distanceMiles = Number((distanceMetres * 0.00062137).toFixed(2))
    console.log('distanceMiles', distanceMiles)

    resolve(distanceMiles)
  })
}

function getCaloriesOnline (name) {
  return new Promise(async (resolve) => {
    console.log('getCaloriesOnline', name)

    request.post({url: 'https://www.myfitnesspal.com/food/search', formData: {search: name}}, function optionalCallback (err, httpResponse, body) {
      if (err) {
        console.error('upload failed:', err)
        resolve(undefined)
      }
      // console.log('Upload successful!  Server responded with:', body)
      var $ = cheerio.load(body)
      var beerListCompare = []
      var beerList = []
      $('.food_info').each(function (i, elem) {
        var html = $(elem).html()
        var foodName = ($(elem).find('a').eq(1).text() + ' ' + $(elem).find('a').eq(0).text()).trim().replace(/[^\w\s]/gi, '')
        var foodText = $(elem).find('.nutritional_info').text().split(',')
        var foodSize = foodText[0].replace('Serving Size:', '').trim().toLowerCase()
        var foodCalories = Number(foodText[1].replace('Calories:', '').trim())
        if (foodSize.includes('pint') || foodSize.includes('glass') || foodSize.includes('bottle')) {
          console.log(i, html, foodText, '-', foodName, '-', foodSize, '-', foodCalories)
          beerListCompare.push(foodName.toLowerCase())
          beerList.push({name: foodName, size: foodSize, calories: foodCalories})
        }
      })
      console.log('beerList', beerList, beerListCompare)

      if (beerList.length > 0) {
        var beerMatch = stringSimilarity.findBestMatch(name.toLowerCase(), beerListCompare)
        var beer = beerList.filter(b => b.name.toLowerCase() === beerMatch.bestMatch.target)[0]
        console.log('beerMatch', name.toLowerCase(), beerMatch.bestMatch.target, beer)
        resolve({name: beer.name, calories: beer.calories})
      } else {
        console.log('No matches online for', name)
        resolve(undefined)
      }
    })
  })
}
async function detectCaloriesFromName (result) {
  return new Promise(async (resolve) => {
    // check local db for name and calories

    var calories
    var name = result.name

    var dbMatch = stringSimilarity.findBestMatch(name.toLowerCase(), beerListNames)
    console.log('dbMatch.bestMatch', dbMatch.bestMatch)
    if (dbMatch.bestMatch.rating > 0.1) {
      console.log('Found calories from local db')
      var matchedBeer = beerListFlat.filter(beer => beer.synonym === dbMatch.bestMatch.target)[0]
      if (matchedBeer.calories !== undefined) {
        calories = matchedBeer.calories
      }
      name = matchedBeer.name

      console.log('Found calories from local db calories', name, calories)
    }

    if (calories === undefined) {
      // TODO // OR search online for calories
      console.log('TODO - Search online for calorie for names', name, result.percentage)
      var caloriesOnlineResult = await getCaloriesOnline(name)

      console.log('caloriesOnlineResult', caloriesOnlineResult)
      if (caloriesOnlineResult !== undefined) {
        calories = caloriesOnlineResult.calories
        name = caloriesOnlineResult.name
      } else if (result.percentage > 0) {
        // OR guess some calories from percentage
        console.log('Calculate calories from percentage: ', name, result.percentage)
        // 10% = 200
        // 3% = 130
        // 10(x-3) + 130
        calories = Math.round((10 * (result.percentage - 3)) + 130)
      } else {
        console.log('Unknown amount of calories')
        // calories = 0
      }
    }
    resolve({
      calories: calories,
      name: name
    })
  })
}

function detectText (buffer) {
  return new Promise(resolve => {
    rekognition.detectText({
      Image: {
        Bytes: buffer
      }
    }, function (err, data) {
      if (err) {
        console.log(err, err.stack)
        resolve({
          'Error': 'Rekognition result failed'
        })
      } else {
        // console.log('Rekognition result', data)
        var nameArray = []
        var percentage
        data.TextDetections.forEach(function (textDetection) {
          if (textDetection.Confidence > 70 && textDetection.Type === 'LINE' && !textDetection.DetectedText.includes('%')) {
            // console.log('textDetection', textDetection.DetectedText)
            nameArray.push(textDetection.DetectedText.replace(/[^a-zA-Z ]/g, ''))
          }
          if (textDetection.Confidence > 70 && textDetection.Type === 'WORD' && textDetection.DetectedText.includes('%')) {
            // console.log('percentage', textDetection.DetectedText)
            percentage = parseFloat(textDetection.DetectedText.replace(/[^\d.-]/g, ''))
          }
        })
        var name = nameArray.join(' ')
        var ocrResult = {
          name: name
        }
        if (percentage) {
          ocrResult.percentage = percentage
        }
        // console.log('ocrResult', ocrResult)
        resolve(ocrResult)
      }
    })
  })
}
// function updateBeerDataWithCalories (name, calories, calorieSource) {
// TODO - Some saving or caching as I changed it, this is only a small hackathon project
// }
function loadBeerData () {
  beerList = JSON.parse(fs.readFileSync('beer-list.json', 'utf8'))
  _.forEach(beerList, function (beer) {
    _.forEach(beer.synonym, function (synonym) {
      beerListNames.push(synonym)
      beerListFlat.push({
        name: beer.name,
        calories: beer.calories,
        synonym: synonym
      })
    })
  })
  console.log('beerList', beerList, beerListNames, beerListFlat)
}
app.listen(PORT, () => console.log('----- Monitor app listening on port ' + PORT))
