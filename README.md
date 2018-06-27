# Lazy Beerstard
> A pint of Guinness will take you 57 minutes to walk off, are you sure it's a good idea?!
Take a photo of your the pub tap logo and we'll show link you with a map of how long it'll take to burn off those calories!

TUI Maker Fair Project 2018 from Dan Garfield

### Base logic
- Take image
- Process image into smaller, cheaply uploadable asset
- Upload image to aws rekognition to determine text
- From text get drink, check any synonyms we may have from the text to get a more accurate drink name
- From name, fetch calorific content from myfitnesspal.com
- From calorie, height and weight, calculate distance required to be walked to burn calories
- Retrieve current location data from user
- Get circular walking route from current position and distance required
-- Create 8 potential waypoints around user based on distance required
-- Create a number of 'leg' options from these waypoints
-- Call google distance service for this route, result with be a number of legs
-- Select the leg that is closest to the desired distance
- Present the map, calorie and distance data to the user
- Present the deeplink to Google Maps to the user

### Server
##### Installation
- Install node js
- Install git and clone repo
- Receive secrets file containing `AWS Rekognition` and `Zeit Now` keys. Alternatively, add your own. View the `checkEnvVars()` method in `lazy-beerstard.js` for the keys.

```bash
. ./.secrets.sh
cd server
node lazy-beerstard.js
```
To deploy to now, run `npm run deploy`

Service currently is live here: `https://lazy-beerstard.now.sh/test`

##### Test files
You can populate the `server/test-images` direcrory with images and update the `server/test-images/test/index.html` file with the file name. If you now open the browser `https://localhost:5000/test`, this page will emulate the calls of the mobile app and test the server APIs.

### Mobile
##### Installation
Use `Expo` - It is a react-native playground that you an install an app on your phone, it allows you to connect the the JS compiler service through your cloud ide. It does remote debugging and live code reloading across the internet.

Everything works really well on `snack.expo.io` apart from the importing of the `react-native-maps-directions` library. This is a little annoying as there was zero installation before, but now you need to install the `expo`
- Install `expo xde` - You can use the cli, this is just a little easier
- Open the `mobile` folder in Expo XDE
- Install `expo` app on your mobile
- Click `share` in Expo XDE and scan with your mobile from the Expo app
- After saving any changes for the mobile project in your IDE (use any), it will live reload to your phone. Somethings it takes a few seconds, or just change something else on a different line to trigger a change

### Still to do
- Better handle location services and turned off / permissions more gracefully handled and earlier, maybe on the first click / app load
- Make the app look good (inspiration from Kitten Tricks)
- Set boundary points and lines for maps
- Add analytics for negatively scanned images, eg, to S3 or locally on now
- Add ability to easily amend and reload synonyms without re-deploying
- Maybe add automated test facility for failed images with synonyms
- Go to the pub - eg, populate synonym data
- Package, register and deploy binaries to Android and Apple app stores
- If time, revisit the OCR approach and add learned images to Rekognition for common alcohol types