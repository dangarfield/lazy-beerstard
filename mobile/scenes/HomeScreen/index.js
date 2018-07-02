import * as React from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Dimensions,
  ImageBackground,
  Image
} from 'react-native'
import { Button, Card } from 'react-native-elements'
import SwiperFlatList from 'react-native-swiper-flatlist'
import { Permissions, Location } from 'expo'
// import { generateMap } from '../../components/MapGenerator'

class ConnectScreen extends React.Component<Props> {
  constructor(props, context) {
    super(props, context)
    this.checkPermissions = this.checkPermissions.bind(this)
    this.checkCameraPermission = this.checkCameraPermission.bind(this)
    this.checkLocationPermission = this.checkLocationPermission.bind(this)
  }

  state = {
    hasCameraPermission: null,
    hasLocationPermission: null,
    locationServicesEnabled: null
  }
  async componentDidMount() {
    console.log('------------------------------------------------------------------------------')
    console.log('Home Screen')
    // console.log('generateMap', await generateMap({lat:51.949383,lng:-0.275732}, 2.2))
    //let fetchRes = await fetch('https://lazy-beerstard.now.sh/map-data?lat=51.949383&lng=-0.275732&distance=2.2')
    //let fetchJson = await fetchRes.json()
    //console.log('fetchJson', fetchJson)
  }
  componentWillMount() {
    this.checkPermissions()
  }
  checkPermissions() {
    this.checkCameraPermission()
    this.checkLocationPermission()
  }
  async checkCameraPermission() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })
    console.log('hasCameraPermission:', status)
  }
  async checkLocationPermission() {
    const { status } = await Permissions.askAsync(Permissions.LOCATION)
    console.log('hasLocationPermission:', status)
    this.setState({ hasLocationPermission: status === 'granted' })

    if(status === 'granted'){
      let providerStatus = await Location.getProviderStatusAsync()
      console.log('providerStatus:', providerStatus, providerStatus.locationServicesEnabled)
      this.setState({ locationServicesEnabled: providerStatus.locationServicesEnabled === true })
    }
  }
  render() {
    let hasCameraPermission = this.state.hasCameraPermission
    let hasLocationPermission = this.state.hasLocationPermission
    let locationServicesEnabled = this.state.locationServicesEnabled
    let allPermissionsGranted = hasCameraPermission && hasLocationPermission && locationServicesEnabled
    console.log('Permissions', hasCameraPermission, hasLocationPermission, locationServicesEnabled, allPermissionsGranted)
    return (
      <View style={styles.container}>
        <ImageBackground
          source={BG_IMAGE}
          style={styles.bgImage}
        >
        <SwiperFlatList
          index={0}
          showPagination
        >
          <View style={[styles.child]}>
            <Image
              style={styles.logo}
              resizeMode="cover"
              source={LOGO_IMAGE}
            />
            {!hasCameraPermission &&
              <Text style={styles.permissionsText}>
              Permission for the app to use the camera is required to get the calorie information
              </Text>
            }
            {!hasLocationPermission &&
              <Text style={styles.permissionsText}>
              Permission for the app to use your location is required to plot your route
              </Text>
            }
            {!locationServicesEnabled &&
              <Text style={styles.permissionsText}>
              Please turn on location services, we need it to plot your route
              </Text>
            }
            {!allPermissionsGranted ? (
              <Button
              title='Check permissions'
              activeOpacity={1}
              underlayColor="transparent"
              onPress={this.checkPermissions}
              buttonStyle={{height: 50, backgroundColor: 'transparent', borderWidth: 2, borderColor: 'white', borderRadius: 30}}
              containerStyle={{marginVertical: 10}}
              titleStyle={{fontWeight: 'bold', color: 'white'}}
            />
            ) : (
              <Button
              title='Take photo of beer tap'
              activeOpacity={1}
              underlayColor="transparent"
              onPress={() => this.props.navigation.navigate('cameraStack', ({name: 'Camera'}))}
              buttonStyle={{height: 50, backgroundColor: 'transparent', borderWidth: 2, borderColor: 'white', borderRadius: 30}}
              containerStyle={{marginVertical: 10}}
              titleStyle={{fontWeight: 'bold', color: 'white'}}
            />
            )
            }

          </View>
          <View style={[styles.child]}>
            <Card
              title='Instructions'>
              <Text style={styles.instructionsText}>
                Instructions for the app
              </Text>
              <Text style={styles.instructionsText}>
                Instructions for the app
              </Text>
              <Text style={styles.instructionsText}>
                Instructions for the app
              </Text>
            </Card>
          </View>
        </SwiperFlatList>
        </ImageBackground>
      </View>
    )
  }
}
export const { width, height } = Dimensions.get('window')
const BG_IMAGE = require('../../assets/images/bg_abstract1.jpg')
const LOGO_IMAGE = require('../../assets/images/kittenImage.png')

const $colorWhite = '#fff'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  child: {
    height,
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center'
  },
  bgImage: {
    flex: 1,
    top: 0,
    left: 0,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    marginBottom: 20
  },
  instructionsText: {
    marginBottom: 10
  },
  permissionsText: {
    margin: 10,
    color: 'white'
  }
})
export default ConnectScreen
