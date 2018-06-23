import * as React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  Linking
} from 'react-native';
import MapView from 'react-native-maps'
import {
  FileSystem,
  ImageManipulator,
  Constants,
  Location,
  Permissions,
} from 'expo';
import MapViewDirections from 'react-native-maps-directions';

// import { generateMap } from '../../components/MapGenerator';

class Results extends React.Component {
  state = {
    name: this.props.navigation.getParam('name'),
    photo: this.props.navigation.getParam('photo'),
    status: 'location',
  };
  init = async () => {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        status: 'error',
        errorMessage:
          'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      // Get location
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        this.setState({
          status: 'error',
          errorMessage: 'Permission to access location was denied',
        });
      }
      console.log('getting location');
      let location = await Location.getCurrentPositionAsync({});
      console.log('location', location);
      this.setState({ status: 'processing', location: location });

      // Process Image
      const uri = this.state.photo;
      console.log('uri', uri);
      const manipResult = await ImageManipulator.manipulate(
        uri,
        [{ resize: { width: 400 } }],
        { format: 'png', base64: true }
      );

      console.log(
        'manipResult',
        'data:image/png;base64,' + manipResult.base64,
        '10'
      );

      // Upload and get calorie data
      this.setState({ status: 'uploading' });
      const formData = new FormData();
      formData.append('weight', '60');
      formData.append('height', '1.6');
      formData.append(
        'imageData',
        'data:image/png;base64,' + manipResult.base64
      );

      // const res = await fetch('http://requestbin.fullcontact.com/1eb732b1', {
      const res = await fetch(
        'https://lazy-beerstard.now.sh/detect-calories-beer',
        {
          // const res = await fetch('http://172.16.2.15:5000/detect-calories-beer', {
          method: 'POST',
          body: JSON.stringify({
            weight: 60,
            height: 1.6,
            imageData: 'data:image/png;base64,' + manipResult.base64,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await res.json();
      console.log('data', data);
      if (data.error) {
        this.setState({ status: 'error', data: data });
      } else {
        // Generate map
        this.setState({ status: 'generating', data: data });
        let url =
          'https://lazy-beerstard.now.sh/map-data?lat=' +
          this.state.location.coords.latitude +
          '&lng=' +
          this.state.location.coords.longitude +
          '&distance=' +
          data.distance;
        console.log('map directions url', url);
        let fetchRes = await fetch(url);
        let directions = await fetchRes.json();
        console.log('directions', directions);

        // Draw map (done)
        this.setState({ status: 'done', directions: directions });

      }
    }
  };

  componentDidMount() {
    this.init();
    // this.testRead()
  }

  renderLocation = () => {
    return (
      <View>
        <Text>Find your location...</Text>
      </View>
    );
  };
  renderProcessing = () => {
    return (
      <View>
        <Text>Photo: {this.state.photo}</Text>
        <Image
          style={{ width: 150, height: 150 }}
          source={{ uri: this.state.photo }}
        />
        <Text>ImageData: {this.state.imageData}</Text>
        <Text>Processing...</Text>
      </View>
    );
  };
  renderUploading = () => {
    return (
      <View>
        <Text>Uploading...</Text>
      </View>
    );
  };
  renderGenerating = () => {
    return (
      <View>
        <Text>Generating map...</Text>
        <Text>Name: {this.state.data.name}</Text>
        <Text>Calories: {this.state.data.calories}</Text>
        <Text>Distance: {this.state.data.distance}</Text>
      </View>
    );
  };
  renderDone = () => {
    const GOOGLE_MAPS_APIKEY = 'AIzaSyChfvGzXklxujKAMRzDSw315AirURM1R10';


    // const origin = {latitude:this.state.directions.origin.lat, longitude:this.state.directions.origin.lng};
    // const destination = {latitude:this.state.directions.destination.lat, longitude:this.state.directions.destination.lng};
    // const initialRegion = {
    //   latitude: this.state.directions.origin.lat,
    //   longitude: this.state.directions.origin.lng,
    //   latitudeDelta: 0.0922,
    //   longitudeDelta: 0.0421
    // }
    const origin = {latitude: 37.3318456, longitude: -122.0296002};
    const destination = {latitude: 37.771707, longitude: -122.4053769};
    const initialRegion = {
        latitude: 37.3318456,
        longitude: -122.0296002,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    const description = this.state.directions.duration.text + ' -> ' + this.state.directions.distance.text + ' -> ' + this.state.data.calories + ' calories'

    // let waypoints = [{latitude:this.state.directions.waypoints[0].lat, longitude:this.state.directions.waypoints[0].lng}]
    let waypoints = []
    this.state.directions.waypoints.forEach(function(waypoint) {
      waypoints.push({latitude:waypoint.lat, longitude:waypoint.lng})
    })
    console.log('renderDone data', origin, destination, initialRegion, waypoints)
    return (
      <View>
        <Text>Done...</Text>
        <Text>Name: {this.state.data.name}</Text>
        <Text>Calories: {this.state.data.calories}</Text>
        <Text>Distance: {this.state.data.distance}</Text>
        <Text>Directions: {this.state.directions.distance.text} in {this.state.directions.duration.text}</Text>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: this.state.directions.origin.lat,
            longitude: this.state.directions.origin.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <MapView.Marker
            coordinate={{latitude:this.state.directions.origin.lat, longitude:this.state.directions.origin.lng}}
            title='You are here'
            description={description}
          />
          <MapView.Marker
            coordinate={{latitude:this.state.directions.waypoints[0].lat, longitude:this.state.directions.waypoints[0].lng}}
            title='Waypoint 1'
            description='Waypoint 1'
          />
          <MapView.Marker
            coordinate={{latitude:this.state.directions.waypoints[1].lat, longitude:this.state.directions.waypoints[1].lng}}
            title='Waypoint 2'
            description='Waypoint 2'
          />
          <MapViewDirections
            origin={{latitude:this.state.directions.origin.lat, longitude:this.state.directions.origin.lng}}
            destination={{latitude:this.state.directions.destination.lat, longitude:this.state.directions.destination.lng}}
            waypoints={waypoints}
            apikey={GOOGLE_MAPS_APIKEY}
          />
        </MapView>



        <TouchableOpacity
          onPress={() =>
            Linking.openURL(this.state.directions.deeplink)
          }>
          <Text>Deeplink: {this.state.directions.deeplink}</Text>
        </TouchableOpacity>

      </View>
    );
  };
  renderError = () => {
    return (
      <View>
        <Text>
          Error: {this.state.data.error} - {this.state.data.name}
        </Text>
        <Image
          style={{ width: 150, height: 150 }}
          source={{ uri: this.state.photo }}
        />
      </View>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <Text>Results Screen</Text>
        <Text>Status: {this.state.status}</Text>
        <Text>Name: {this.state.name}</Text>

        {this.state.status === 'location' && this.renderLocation()}
        {this.state.status === 'processing' && this.renderProcessing()}
        {this.state.status === 'uploading' && this.renderUploading()}
        {this.state.status === 'generating' && this.renderGenerating()}

        {this.state.status === 'done' && this.renderDone()}
        {this.state.status === 'error' && this.renderError()}

        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate('homeStack', { name: 'Home' })
          }>
          <Text style={styles.text}>Back home</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default Results;

const $colorWhite = '#fff';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: $colorWhite,
    alignItems: 'center',
  },
  map: {
    width: 250,
    height: 250,
  }
});
