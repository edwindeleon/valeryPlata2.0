import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  StyleSheet,
  TextInput,
  Picker,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions
} from 'react-native'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'react-native-fetch-blob'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Spinner from 'react-native-loading-spinner-overlay'
import Icon from 'react-native-vector-icons/Ionicons'
import { getColor } from '../config'
import { firebaseApp } from '../../firebase'
import firebase from 'firebase'
import { observer,inject } from 'mobx-react/native'


const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const screenWidth = Dimensions.get('window').width

const uploadImage = (uri, imageName, mime = 'image/jpg') => {
  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      let uploadBlob = null
      const imageRef = firebaseApp.storage().ref('posts').child(imageName)
      fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

@inject("appStore") @observer
export default class AdminSendNot extends Component {
  constructor(props) {
    super(props)
    this.state = {
      postStatus: null,
      postText: '',
      postTitle: '',
      imagePath: null,
      imageHeight: null,
      imageWidth: null,
      spinnervisible: false,
    }
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  componentDidUpdate() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
  }

  componentDidMount() {
    this.setState({
      imagePath: 'https://firebasestorage.googleapis.com/v0/b/joyeria-valery.appspot.com/o/images%2Fportada-valery-plata.png?alt=media&token=cb455d75-8712-45f0-a60a-69235693e483',
    })
  }

  render() {
    const height = ((screenWidth-40)*this.state.imageHeight/this.state.imageWidth)
    const photo = this.state.imagePath ?
      <View style={{ flex:1, }}>
        <Image
          source={{ uri:this.state.imagePath }}
          resizeMode='contain'
          resizeMethod='scale'
          style={{
            height: height,
            width: screenWidth-40,
            alignSelf: 'center',
            marginBottom: 10,
          }}
        />
      </View>
     :
       <View style={{ flex:1, marginBottom: 10,}}>
         <Text></Text>
       </View>
    return (
      <View style={styles.container}>
        <Spinner visible={this.state.spinnervisible} />
          <KeyboardAwareScrollView ref='scrollContent'>
            <View style={styles.divider}>
              <Text style={styles.title}>{'ENVIAR NOTIFICACION PUSH'}</Text>
              { photo }
              
              <TouchableOpacity style={styles.btnAdd} onPress={this._takePicture}>
                <Icon
                  name={'md-camera'}
                  size={30}
                  color={'#fff'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnAdd} onPress={this._selectPicture}>
                <Icon
                  name={'md-images'}
                  size={30}
                  color={'#fff'}
                />
              </TouchableOpacity>
              <Text style={styles.message}>{this.state.postStatus}</Text>
              
              <View style={styles.titleContainer}>
                <TextInput
                style={styles.inputField}
                maxLength={34}
                value={this.state.postTitle}
                onChangeText={(text) => this.setState({ postTitle: text })}
                underlineColorAndroid='transparent'
                placeholder='Título'
                placeholderTextColor='rgba(0,0,0,.6)'
                onSubmitEditing={(event) => {
                  this.refs.SecondInput.focus();
                }}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                ref='ThirdInput'
                multiline={true}
                style={styles.inputField}
                underlineColorAndroid='transparent'
                placeholder='Mensaje'
                value={this.state.postText}
                onChangeText={(text) => this.setState({ postText: text })}
                placeholderTextColor='rgba(0,0,0,.6)'
                />
              </View>
              <TouchableOpacity style={styles.btnAdd} onPress={this._handleNewPost}>
                <Icon
                  name={'md-add'}
                  size={30}
                  color={'#fff'}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
    )
  }
  _selectPicture = () => {
    const cam_options = {
      mediaType: 'photo',
      maxWidth: 600,
      maxHeight: 600,
      quality: 1,
      noData: true,
    };
    ImagePicker.launchImageLibrary(cam_options, (response) => {
      if (response.didCancel) {
      }
      else if (response.error) {
      }
      else {
        this.setState({
          imagePath: response.uri,
          imageHeight: response.height,
          imageWidth: response.width,
        })
      }
    })
  }
  _takePicture = () => {
    const cam_options = {
      mediaType: 'photo',
      maxWidth: 600,
      maxHeight: 600,
      quality: 1,
      noData: true,
    };
    ImagePicker.launchCamera(cam_options, (response) => {
      if (response.didCancel) {
      }
      else if (response.error) {
      }
      else {
        this.setState({
          imagePath: response.uri,
          imageHeight: response.height,
          imageWidth: response.width,
        })
      }
    })
  }
 _handleNewPost = () => {
    this.setState({
      postStatus: 'Enviando notificacion...',
    })
    
    
      if (this.state.postTitle.length > 0) {
          this.setState({ spinnervisible: true })
          const uid = this.props.appStore.user.uid
          const username = this.props.appStore.user.displayName
          const newPostKey = firebaseApp.database().ref('push_notifications').push().key
          const imageName = `${newPostKey}.jpg`
          
            fetch('https://onesignal.com/api/v1/notifications',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Basic '+this.props.appStore.onesignal_api_key,
              },
              body: JSON.stringify(
              {
                app_id: this.props.appStore.onesignal_app_id,
                included_segments: ["All"],
                headings: {"en": "Valery Plata"},
                android_sound: "fishing",
                data: {"puid": newPostKey},
                big_picture: this.state.imagePath,
                ios_sound: "fishing.caf",
                contents: {"en":" " + this.state.postTitle + "..." + this.state.postText},
                //filters: [{"field":"tag","key":"username","relation":"=","value":"Herve"}],
              })
            })
            .then((responseData) => {
                console.log("Push POST:" + JSON.stringify(responseData));
            })
            .done()
            console.log(this.state.postText);
            const postData = {
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
              text: this.state.postText.replace(/(\r\n|\n|\r)/gm,""),
              title: this.state.postTitle,
              image: this.state.imagePath,
              imageHeight: this.state.imageHeight,
              imageWidth: this.state.imageWidth,
            }
            let updates = {}
            updates['/push_notifications/' + newPostKey] = postData
            firebaseApp.database().ref().update(updates)
            .then(() => {
              this.setState({
                              postStatus: 'Notificacion enviada correctamente!',
                              postTitle: '',
                              postText: '',
                              imagePath: 'https://firebasestorage.googleapis.com/v0/b/joyeria-valery.appspot.com/o/images%2Fportada-valery-plata.png?alt=media&token=cb455d75-8712-45f0-a60a-69235693e483',
                              imageHeight: null,
                              imageWidth: null,
                              spinnervisible: false,
                            })
              setTimeout(() => {
                this.setState({ postStatus: null })
              }, 3000)
              setTimeout(() => {
                this.refs.scrollContent.scrollToPosition(0, 0, true)
              }, 1000)
            })
            .catch(() => {
              this.setState({ postStatus: 'Something went wrong!!!' })
              this.setState({ spinnervisible: false })
            })
          
          

      } else {
        this.setState({ postStatus: 'Por favor introduzca título' })
      }
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    padding: 10,
    //flexDirection: 'column',
  },
  divider: {
    margin: 2,
    paddingBottom: 15,
    marginBottom: 30,
  },
  title: {
    marginTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    color: getColor()
  },
  message: {
    textAlign: 'center',
  },
  inputContainer: {
    height: 80,
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,.6)',
    marginBottom: 10,
    marginTop: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 2,
  },
  titleContainer: {
    height: 40,
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,.6)',
    marginBottom: 10,
    marginTop: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 2,
  },
  inputField: {
    flex: 1,
    width: 300,
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 15,
    color: '#666'
  },
  btnAdd: {
    width: 280,
    height: 40,
    backgroundColor: getColor(),
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  postImage: {
    alignSelf: 'center',
    height: 140,
    width: 140,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
})
