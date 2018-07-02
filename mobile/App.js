import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createStackNavigator } from 'react-navigation' // 2.3.1
import HomeScreen from './scenes/HomeScreen'
import CameraScreen from './scenes/CameraScreen'
import ResultsScreen from './scenes/ResultsScreen'

// const noTransitionConfig = () => ({
//   transitionSpec: {
//     duration: 0,
//     timing: Animated.timing,
//     easing: Easing.step0
//   }
// })

// login stack
const HomeStack = createStackNavigator({
  connectScreen: { screen: HomeScreen, navigationOptions: { title: 'Home' } }
}, {
  headerMode: 'none',
  navigationOptions: {
    headerStyle: {backgroundColor: '#E6E6E6'}
  }
})
const CameraStack = createStackNavigator({
  connectScreen: { screen: CameraScreen, navigationOptions: { title: 'Camera' } }
}, {
  headerMode: 'none',
  navigationOptions: {
    headerStyle: {backgroundColor: '#E6E6E6'}
  }
})
const ResultsStack = createStackNavigator({
  connectScreen: { screen: ResultsScreen, navigationOptions: { title: 'Results' } }
}, {
  headerMode: 'none',
  navigationOptions: {
    headerStyle: {backgroundColor: '#E6E6E6'}
  }
})

// Manifest of possible screens
const PrimaryNav = createStackNavigator({
  homeStack: { screen: HomeStack },
  cameraStack: { screen: CameraStack },
  resultsStack: { screen: ResultsStack }
}, {
  // Default config for all screens
  headerMode: 'none',
  // initialRouteName: 'homeStack'
  initialRouteName: 'homeStack'
  // transitionConfig: noTransitionConfig
})

export default class App extends React.Component {
  render () {
    return (
      <View style={styles.container}>
        <PrimaryNav />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
})
