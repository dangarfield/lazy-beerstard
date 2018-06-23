import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Camera, Permissions, ImagePicker } from 'expo';

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    status: 'Take photo'
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  takePicture = async () => {
    if (this.camera) {
      this.setState({status:'Saving photo'})
      console.log('saving photo')
      let photo = await this.camera.takePictureAsync();
      console.log('photo', photo)
      // let uploadResponse = await this.uploadImageAsync(photo.uri);
      // console.log('uploadResponse', uploadResponse)
      // let uploadResult = await uploadResponse.json();
      // console.log('uploadResult', uploadResult)
      // this.setState({ status: uploadResult.location });

      this.setState({status:'Processing photo'})
      this.props.navigation.navigate('resultsStack', {name: 'Results', photo:photo.uri})
    } else {
      this.setState({status:'Error: Unable to take photo'})
    }
  }
  uploadImageAsync = async (uri) => {
    // let apiUrl = 'http://requestbin.fullcontact.com/18zy0pz1';
    let apiUrl = 'https://lazy-beerstard.now.sh/detect-calories-beer-file-upload';

    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('image', {
      uri,
      name: `image.${fileType}`,
      type: `image/${fileType}`,
    });
    formData.append('height', '1.6')
    formData.append('weight', '60')

    let options = {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    };
    console.log('uploading')
    return fetch(apiUrl, options);
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            style={{ flex: 1 }}
            type={this.state.type}
            ref={ref => {
              this.camera = ref;
            }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Flip{' '}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => this.props.navigation.navigate('homeStack', ({name: 'Home'}))}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Home{' '}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => this.props.navigation.navigate('resultsStack', ({name: 'Results'}))}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Results{' '}
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={this.takePicture}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'red' }}>
                  {' '}{this.state.status}{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}