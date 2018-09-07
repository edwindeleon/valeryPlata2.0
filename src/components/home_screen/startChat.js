import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { getColor } from '../config'
import { firebaseApp, firebaseAuth, firebaseDatabase } from '../../firebase'
import firebase from 'firebase'
import CommentList from './CommentList'
import { observer,inject } from 'mobx-react/native'


@inject("appStore") @observer
export default class StartChat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      postText:'',
      previousChat:0,
      postStatus: null,
    }
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }
  

  componentDidUpdate() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
    const { uid } = firebaseAuth.currentUser
    firebaseApp.database().ref(`chatsList/${uid}`).once('value')
      .then((snapshot) => {
        if (snapshot.val()) {
          let previousChat = 1
          this.props.appStore.previousChat = previousChat
          this.setState({ previousChat: previousChat })
        }
      }) 
  }

  componentDidMount() {

  }

  
  render() {

          return (
              <View style={styles.container2}>
              
                
                  <KeyboardAwareScrollView ref='scrollContent'>
                    <View style={styles.divider}>
                      <Text style={styles.title}>{'INICIAR CHAT'}</Text>
                      
                      <View style={styles.inputContainer}>
                        <TextInput
                        ref='ThirdInput'
                        multiline={true}
                        style={styles.inputField}
                        underlineColorAndroid='transparent'
                        placeholder='Escriba su mensaje para iniciar el chat'
                        value={this.state.postText}
                        onChangeText={(mensaje) => this.setState({ postText: mensaje })}
                        placeholderTextColor='rgba(0,0,0,.6)'
                        />
                      
                        <TouchableOpacity style={styles.btnAdd} onPress={this._handleNewPost}>
                        <Icon name="ios-send-outline" size={30} color="gray" />
                          
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.message}>{this.state.postStatus}</Text>
                  </KeyboardAwareScrollView>
                </View>
          )
          
        
  }
  _handleNewPost = () => {
    this.setState({
      postStatus: 'iniciando chat...',
    })
    

      if (this.state.postText.length > 0) {
        
          
          const uid = this.props.appStore.user.uid
          const username = this.props.appStore.user.displayName
          const email = this.props.appStore.user.email
          const newPostKey = firebaseApp.database().ref('global_chats').push().key
            const postData = {
              username: username,
              uid: uid,
              email: email,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
              status: "disponible",
              clientId: "",
              clientName: "",
              new_messages: 0,
              text: this.state.postText.replace(/(\r\n|\n|\r)/gm,""),
              puid: newPostKey,
            }
            let updates = {}
            this.props.appStore.post_count = this.props.appStore.post_count + 1
            updates['/users/' + uid + '/post_count'] = this.props.appStore.post_count
            this.props.appStore.chat_count = this.props.appStore.chat_count + 1
            updates['/users/' + uid + '/chat_count'] = this.props.appStore.chat_count
            updates['/chatsList/' + uid + '/user'] = this.props.appStore.user.uid
            updates['/chats/' + uid + '/' + newPostKey] = postData
            updates['/global_chats/' + newPostKey] = postData
            updates['/user_posts/' + uid + '/posts/' + newPostKey] = postData
            updates['/user_chats/' + uid + '/posts/' + newPostKey] = postData
            updates['/messages_notif/' + newPostKey + '/include_player_ids'] = [this.props.appStore.user.uid]
            firebaseApp.database().ref().update(updates)
            .then(() => {
              this.setState({
                              postStatus: 'Chat iniciado!',
                              postText: '',
                              previousChat: 1
                              
                            })

              setTimeout(() => {
                this.setState({ postStatus: null })
              }, 5000)
            })

            .catch(() => {
              this.setState({ postStatus: 'Something went wrong!!!' })
              
            })
          
          .catch(error => {
            console.log(error)
            
          })

        
      } else {
        this.setState({ postStatus: 'Por favor introduzca mensaje' })
      }
    
  }
  
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgray',
    paddingTop: 10,
  },
  container2: {
    flex: 1,
    backgroundColor: 'lightgray',
    paddingTop: 10,
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
  inputContainer: {
    height: 50,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
      bottom: 0
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
  message: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 10,
    width: 280,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  input: {
    height: 50,
    flex: 1
  }
});