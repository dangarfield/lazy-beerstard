var googleMaps = require('@google/maps').createClient({
  key: 'AIzaSyChfvGzXklxujKAMRzDSw315AirURM1R10',
  Promise: Promise
})

exports.generateMap = async function (home, distance) {
  console.log('1 getBoundingBoxPoints')
  var boundingBox = await getBoundingBoxPoints(home.lat, home.lng, distance)
  console.log('1> getBoundingBoxPoints result')

  console.log('2 constructWayPointArray')
  var waypointArray = await constructWayPointArray(boundingBox)
  console.log('2> constructWayPointArray result')

  console.log('3 createStopoverWaypoints')
  let stopOverWayPoints = await createStopoverWaypoints(home, waypointArray)
  console.log('3> createStopoverWaypoints result')

  // console.log('4 createDirectionsUrl');
  // var url = await createDirectionsUrl(home, home, stopOverWayPoints);
  // console.log('4> createDirectionsUrl result', url);

  console.log('4 getDirections')
  var directions = await getDirections(home, home, stopOverWayPoints)
  console.log('4> directions', directions)

  // console.log('1 getBoundingBoxPoints');
  // getBoundingBoxPoints(home.lat, home.lng, distance)
  // .then(function(boundingBox) {
  //   console.log('2 constructWayPointArray', boundingBox);
  //   return constructWayPointArray(boundingBox)
  // })
  // .then(function(waypointArray) {
  //   console.log('3 createStopoverWaypoints', waypointArray);
  //   return createStopoverWaypoints(waypointArray)
  // })
  // .then(function(stopOverWayPoints) {
  //   console.log('4 createDirectionsUrl');
  //   return createDirectionsUrl(home, home, stopOverWayPoints)
  // })
  // .then(function(url) {
  //   console.log('5 getDirections', url);
  //   return getDirections(url)
  // })
  // .then(function(data) {
  //   console.log('6 data', data);
  //   return data
  // })

  console.log('5 filterDirectionsForBestLeg init')
  var result = filterDirectionsForBestLeg(directions, distance)
  console.log('5> filterDirectionsForBestLeg result')
  // renderMapDirections(directions, map, $body);

  console.log('6 createDeepLinkurl init')
  result = createDeepLinkurl(result)
  console.log('6> createDeepLinkurl init')
  return result
}

function constructWayPointArray (boundingBox) {
  return new Promise(resolve => {
    console.log('2a constructWayPointArray start')
    var waypointArray = []
    waypointArray.push([boundingBox.TL, boundingBox.ML])
    waypointArray.push([boundingBox.ML, boundingBox.TR])
    waypointArray.push([boundingBox.TR, boundingBox.MR])
    waypointArray.push([boundingBox.MR, boundingBox.MR])
    waypointArray.push([boundingBox.BR, boundingBox.BM])
    waypointArray.push([boundingBox.BM, boundingBox.BL])
    waypointArray.push([boundingBox.BL, boundingBox.ML])
    waypointArray.push([boundingBox.ML, boundingBox.TL])
    console.log('2b constructWayPointArray resolve')
    resolve(waypointArray)
  })
}

function createStopoverWaypoints (home, waypointArray) {
  return new Promise(resolve => {
    console.log('3a createStopoverWaypoints start')
    var stopOverWayPoints = []
    waypointArray.forEach(function (waypointArrayLeg) {
      waypointArrayLeg.forEach(function (waypoint) {
        stopOverWayPoints.push({
          location: waypoint,
          stopover: false
        })
      })
      stopOverWayPoints.push({
        location: home,
        stopover: true
      })
    })
    stopOverWayPoints.pop()
    console.log('3b createStopoverWaypoints resolve')
    resolve(stopOverWayPoints)
  })
}

// function createDirectionsUrl(origin, destination, waypoints) {
//   return new Promise(async resolve => {
//     console.log('4a createDirectionsUrl', origin, destination, waypoints);
//     let waypointStringArray = [];
//     waypoints.forEach(function(waypoint) {
//       if (waypoint.stopover) {
//         waypointStringArray.push(
//           waypoint.location.lat + ',' + waypoint.location.lng
//         );
//       } else {
//         waypointStringArray.push(
//           'via:' + waypoint.location.lat + ',' + waypoint.location.lng
//         );
//       }
//     });
//     let waypointString = waypointStringArray.join('|');

//     let url = 'https://maps.googleapis.com/maps/api/directions/json';
//     url = url + '?key=AIzaSyChfvGzXklxujKAMRzDSw315AirURM1R10';
//     url = url + '&origin=' + origin.lat + ',' + origin.lng; //'41.43206,-81.38992';
//     url = url + '&destination=' + destination.lat + ',' + destination.lng; //'41.53206,-81.48992'
//     url = url + '&waypoints=' + waypointString;
//     url = url + '&optimizeWaypoints=' + 'false';
//     url = url + '&mode=' + 'walking';
//     url = url + '&units=' + 'imperial';

//     console.log('4b createDirectionsUrl resolve', url);
//     resolve(url);
//   });
// }

async function getDirections (origin, destination, waypoints) {
  // return new Promise(async resolve => {
  console.log('4a getDirections', origin, destination, waypoints)
//     console.log('4a createDirectionsUrl', origin, destination, waypoints);
  let waypointStringArray = []
  waypoints.forEach(function (waypoint) {
    if (waypoint.stopover) {
      waypointStringArray.push(
          waypoint.location.lat + ',' + waypoint.location.lng
        )
    } else {
      waypointStringArray.push(
          'via:' + waypoint.location.lat + ',' + waypoint.location.lng
        )
    }
  })
  let waypointString = waypointStringArray.join('|')
  console.log('4b getDirections waypointString', waypointString)

  let result = await googleMaps.directions({
    origin: origin,
    destination: destination,
    waypoints: waypointString,
    optimize: false,
    mode: 'walking',
    units: 'imperial'
  })
  .asPromise()
  .then(function (response) {
    console.log('4c getDirections response', response)
    return response
  })
  console.log('4d getDirections resolve', result)
  return result
}

const earthRadius = 3960.0
const degreesToRadians = Math.PI / 180
const radiansToDegrees = 180 / Math.PI

// function changeInLat(miles) {
//   return (miles / earthRadius) * radiansToDegrees;
// }

// function changeInLng(latitude, miles) {
//   let r = earthRadius * Math.cos(latitude * degreesToRadians);
//   return (miles / r) * radiansToDegrees;
// }

async function getBoundingBoxPoints (lat, lng, distance) {
  // delta will be 4 points around centre that makes a square of the set distance

  console.log('1a getBoundingBoxPoints start')
  var delta = distance / 6
    // var latDiff = changeInLat(delta);
  var latDiff = (delta / earthRadius) * radiansToDegrees
  let r = earthRadius * Math.cos(lat * degreesToRadians)
  var lngDiff = (delta / r) * radiansToDegrees
    // var lngDiff = changeInLng(lat, delta);
  console.log(
      '1b fixed',
      earthRadius,
      degreesToRadians,
      radiansToDegrees
    )
  console.log('1c delta', delta, latDiff, lngDiff)

  console.log('1d getBoundingBoxPoints create')
  let boundingBox = {
    TL: {
      lat: Number((lat + latDiff).toFixed(6)),
      lng: Number((lng - lngDiff).toFixed(6))
    },
    TM: {
      lat: Number((lat + latDiff).toFixed(6)),
      lng: Number(lng.toFixed(6))
    },
    TR: {
      lat: Number((lat + latDiff).toFixed(6)),
      lng: Number((lng + lngDiff).toFixed(6))
    },

    ML: {
      lat: Number(lat.toFixed(6)),
      lng: Number((lng - lngDiff).toFixed(6))
    },
    MR: {
      lat: Number(lat.toFixed(6)),
      lng: Number((lng + lngDiff).toFixed(6))
    },

    BL: {
      lat: Number((lat - latDiff).toFixed(6)),
      lng: Number((lng - lngDiff).toFixed(6))
    },
    BM: {
      lat: Number((lat - latDiff).toFixed(6)),
      lng: Number(lng.toFixed(6))
    },
    BR: {
      lat: Number((lat - latDiff).toFixed(6)),
      lng: Number((lng + lngDiff).toFixed(6))
    }
  }
  console.log('1e getBoundingBoxPoints resolve')
  return boundingBox
}

function filterDirectionsForBestLeg (directions, distance) {
  console.log('5a filterDirectionsForBestLeg start')
  var distanceMetres = Math.round(distance * 1609.344)
  directions.json.routes[0].legs.sort(function (a, b) {
    return (
      Math.abs(a.distance.value - distanceMetres) >
      Math.abs(b.distance.value - distanceMetres)
    )
  })
  directions.json.routes[0].legs.splice(1)
  delete directions.json.routes[0].bounds
  console.log('5b filterDirectionsForBestLeg filter')
  var waypoints = []
  directions.json.routes[0].legs[0].via_waypoint.forEach(function (waypoint) {
    waypoints.push(waypoint.location)
  })

  // Get steps for drawing polylines
  console.log('directions.json.routes[0].legs[0]', directions.json.routes[0].legs[0])
  var polyline = []

  var initialRegion = {}
  initialRegion.lats = [directions.json.routes[0].legs[0].start_location.lat]
  initialRegion.lngs = [directions.json.routes[0].legs[0].start_location.lng]

  directions.json.routes[0].legs[0].steps.forEach(function (step) {
    let polylineArray = decodePath(step.polyline.points)
    polylineArray.forEach(function (part, i) {
      polyline.push({
        latitude: part.lat,
        longitude: part.lng
      })
      initialRegion.lats.push(part.lat)
      initialRegion.lngs.push(part.lng)
    })
    // console.log('polylineArray', polylineArray)
  })

  // Get coordinates for initial region
  initialRegion.lats.sort(function (a, b) { return a - b })
  initialRegion.lngs.sort(function (a, b) { return a - b })
  initialRegion.latMin = initialRegion.lats[0]
  initialRegion.latMax = initialRegion.lats[initialRegion.lats.length - 1]
  initialRegion.lngMin = initialRegion.lngs[0]
  initialRegion.lngMax = initialRegion.lngs[initialRegion.lngs.length - 1]
  initialRegion.latitudeDelta = Number((Math.abs(initialRegion.latMax - initialRegion.latMin)).toFixed(6))
  initialRegion.longitudeDelta = Number((Math.abs(initialRegion.lngMax - initialRegion.lngMin)).toFixed(6))
  initialRegion.latitude = Number((initialRegion.latMax - (initialRegion.latitudeDelta / 2)).toFixed(6))
  initialRegion.longitude = Number((initialRegion.lngMax - (initialRegion.longitudeDelta / 2)).toFixed(6))
  console.log('initialRegion', initialRegion)
  delete initialRegion.lats
  delete initialRegion.lngs
  delete initialRegion.latMin
  delete initialRegion.latMax
  delete initialRegion.lngMin
  delete initialRegion.lngMax
  console.log('initialRegion', initialRegion)
  var result = {
    origin: directions.json.routes[0].legs[0].start_location,
    destination: directions.json.routes[0].legs[0].end_location,
    waypoints: waypoints,
    distance: directions.json.routes[0].legs[0].distance,
    duration: directions.json.routes[0].legs[0].duration,
    // steps: directions.json.routes[0].legs[0].steps,
    polyline: polyline,
    initialRegion: initialRegion
  }
  console.log('5c filterDirectionsForBestLeg result')
  return result
}

function createDeepLinkurl (result) {
  // https://www.google.com/maps/dir/?api=1&amp;origin=51.946076,-0.27876259999993636&amp;destination=51.946076,-0.27876259999993636&amp;waypoints=51.9415816,-0.27153580000003785|51.9412628,-0.2790938000000551&amp;travelmode=walking
  console.log('6a createDeepLinkurl start')
  var waypointsStringArray = []
  result.waypoints.forEach(function (waypoint) {
    waypointsStringArray.push(waypoint.lat + ',' + waypoint.lng)
  })
  var waypointsString = waypointsStringArray.join('|')

  var url = 'https://www.google.com/maps/dir/?api=1'
  url = url + '&origin=' + result.origin.lat + ',' + result.origin.lng
  url = url + '&destination=' + result.destination.lat + ',' + result.destination.lng
  url = url + '&waypoints=' + waypointsString
  url = url + '&travelmode=walking'
  result.deeplink = url
  console.log('6b createDeepLinkurl return')
  return result
}

function decodePath (encodedPath) {
  var len = encodedPath.length || 0
  var path = new Array(Math.floor(encodedPath.length / 2))
  var index = 0
  var lat = 0
  var lng = 0

  for (var pointIndex = 0; index < len; ++pointIndex) {
    var result = 1
    var shift = 0
    var b
    do {
      b = encodedPath.charCodeAt(index++) - 63 - 1
      result += b << shift
      shift += 5
    } while (b >= 0x1f)
    lat += ((result & 1) ? ~(result >> 1) : (result >> 1))

    result = 1
    shift = 0
    do {
      b = encodedPath.charCodeAt(index++) - 63 - 1
      result += b << shift
      shift += 5
    } while (b >= 0x1f)
    lng += ((result & 1) ? ~(result >> 1) : (result >> 1))

    path[pointIndex] = {lat: lat * 1e-5, lng: lng * 1e-5}
  }
  path.length = pointIndex

  return path
}
