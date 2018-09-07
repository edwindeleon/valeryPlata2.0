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
import firebase from 'firebase'
import { firebaseApp } from '../../firebase'
import { observer,inject } from 'mobx-react/native'


const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob
const screenWidth = Dimensions.get('window').width

@inject("appStore") @observer
export default class PushNot extends Component {
  constructor(props) {
    super(props)
    this.state = {
      postStatus: '',
      postText: '',
      postTitle: '',
      postPrice: '',
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
  }

  render() {
    
    return (
      <View style={styles.container}>
        <Spinner visible={this.state.spinnervisible} />
          <KeyboardAwareScrollView ref='scrollContent'>
            <View style={styles.divider}>
              <Text style={styles.title}>{'ENVIAR NOTIFICACION PUSH'}</Text>
              
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
                multiline={true}
                style={styles.inputField}
                underlineColorAndroid='transparent'
                placeholder='Mensaje'
                value={this.state.postText}
                onChangeText={(mensajeText) => this.setState({ postText: mensajeText })}
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


 _handleNewPost = () => {
    this.setState({
      postStatus: 'Enviando notificacion...',
    })
    
      if (this.state.postTitle.length > 0) {
          this.setState({ spinnervisible: true })
            const uid = this.props.appStore.user.uid
            const newPostKey = firebaseApp.database().ref('push_notifications').push().key
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
                ios_sound: "fishing.caf",
                contents: {"en":" "+this.state.postTitle+"...\n"+this.state.postText},
                
              })
            })
            .then((responseData) => {
                console.log("Push POST:" + JSON.stringify(responseData));
            })
            .done()
            console.log(this.state.postText);
            const postData = {
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              text: this.state.postText.replace(/(\r\n|\n|\r)/gm,""),
              title: this.state.postTitle,
            }
            let updates = {}
            
            updates['/push_notifications/' + newPostKey] = postData
            firebaseApp.database().ref().update(updates)
            .then(() => {
              this.setState({
                              postStatus: 'Notificacion enviada correctamente!',
                              postTitle: '',
                              postText: '',
                              spinnervisible: false,
                            })
              setTimeout(() => {
                this.setState({ postStatus: '' })
              }, 5000)
            })
            .catch(error => {
            console.log(error)
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
