const fs = require('fs')
const axios = require('axios')

const PORT = process.env.LAZY_BEERSTARD_PORT
const URL = 'http://localhost:' + PORT + '/detect-calories-beer'

function startTest () {
  console.log('Detect calories url', URL)

  // get list of files in test directory and iterate around lists
  fs.readdirSync('test-images').forEach(file => {
    if (file.includes('weiser.jpg')) {
      console.log('Test image:', file)

      // read file into buffer
      var buffer = fs.readFileSync('test-images/' + file)
      console.log('buffer', buffer.length)

      // send buffer to server

      axios.post(URL, { imageData: buffer, weight: 60, height: 1.6 })
        .then(res => {
          console.log('res.data', file, res.data)
        })
        .catch(error => {
          if (error) {
            console.log('error')
          }
        })
      // validate output
    }
  })
}
startTest()
