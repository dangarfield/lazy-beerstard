import * as React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text
} from 'react-native';

// import { generateMap } from '../../components/MapGenerator';

class ConnectScreen extends React.Component<Props> {

  async componentDidMount() {
    console.log('------------------------------------------------------------------------------')
    console.log('Home Screen')
    // console.log('generateMap', await generateMap({lat:51.949383,lng:-0.275732}, 2.2))
    let fetchRes = await fetch('https://lazy-beerstard.now.sh/map-data?lat=51.949383&lng=-0.275732&distance=2.2')
    let fetchJson = await fetchRes.json()
    console.log('fetchJson', fetchJson)
  }

  render() {
    return (
      <View style={styles.container}>
          <Text>Home Screen</Text>
        <TouchableOpacity style={styles.mt10}
          onPress={() => this.props.navigation.navigate('cameraStack', ({name: 'Camera'}))} >
            <Text style={styles.text}>Go to camera</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const $colorWhite = '#fff';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: $colorWhite,
    alignItems: 'center'
  },
  mt10: {
    marginTop: 100
  },
  text: {
    color: '#000'
  }
});
export default ConnectScreen;
