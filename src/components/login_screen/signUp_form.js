import React, { Component } from 'react'
import {
  View,
  ScrollView,
  Text,
  TextInput,
  BackAndroid,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  Modal,
  TouchableHighlight,
} from 'react-native'
import { firebaseApp } from '../../firebase'
import firebase from 'firebase'
import { getColor } from '../config'
import * as Animatable from 'react-native-animatable'
import { Actions } from 'react-native-router-flux'
import { observer,inject } from 'mobx-react/native'
import OneSignal from 'react-native-onesignal'



@inject("appStore") @observer
export default class SignUpForm extends Component {
  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      init: true,
      errMsg: null,
      signUpSuccess: false,
      name: '',
      email: '',
      password: '',
      modalVisible: false,
      usersNumber: 0
    }
  }

  componentDidMount() {
    console.log("--------- SIGN UP --------- ")
    this.props.appStore.tracker.trackScreenView('SIGN UP')
    BackAndroid.addEventListener('backBtnPressed', this._handleBackBtnPress)

    firebaseApp.database().ref(`users_count`).child(`counter`).on('value',
    (snapshot) => {
      let usersNumber = snapshot.val().counting
      this.setState({
        usersNumber: usersNumber
      });
      
    });
    
    
  }

  componentDidUpdate() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('backBtnPressed', this._handleBackBtnPress)
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  render() {
    
    const animation = this.state.init ? 'bounceInUp' : 'bounceOutDown'

    const errorMessage = this.state.errMsg ?
      <Text style={styles.errMsg}>{this.state.errMsg}</Text>
    : null

    const signUpForm = this.state.signUpSuccess ?
      null
    :
      <View>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
        >
          <View style={{ marginTop:22 }}>
            <ScrollView>
              <TouchableOpacity style={{ alignItems: 'center', }} onPress={() => {this.setModalVisible(!this.state.modalVisible)}}>
                <View style={styles.submitBtnContainer}>
                  <Text style={styles.submitBtn}>CERRAR</Text>
                </View>
              </TouchableOpacity>
             
              <TouchableOpacity style={{ alignItems: 'center', }} onPress={() => {this.setModalVisible(!this.state.modalVisible)}}>
                <View style={styles.submitBtnContainer}>
                  <Text style={styles.submitBtn}>CERRAR</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
         </View>
        </Modal>
        
        <View style={[styles.inputContainer, { marginBottom: 10 }]}>

          <TextInput
          style={styles.inputField}
          value={this.state.name}
          onChangeText={(text) => this.setState({ name: text })}
          autoCapitalize='words'
          autoCorrect={false}
          underlineColorAndroid='transparent'
          placeholder='Nombre'
          placeholderTextColor='rgba(255,255,255,.6)'
          onSubmitEditing={(event) => {
            this.refs.SecondInput.focus();
          }}
          />
        </View>
        <View style={[styles.inputContainer, { marginBottom: 10 }]}>
          <TextInput
          ref='SecondInput'
          style={styles.inputField}
          value={this.state.email}
          keyboardType='email-address'
          autoCorrect={false}
          autoCapitalize='none'
          onChangeText={(text) => this.setState({ email: text })}
          underlineColorAndroid='transparent'
          placeholder='E-mail'
          placeholderTextColor='rgba(255,255,255,.6)'
          onSubmitEditing={(event) => {
            this.refs.ThirdInput.focus();
          }}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
          ref='ThirdInput'
          style={styles.inputField}
          value={this.state.password}
          onChangeText={(text) => this.setState({ password: text })}
          onSubmitEditing={(event) => {this._handleSignUp()}}
          underlineColorAndroid='transparent'
          placeholder='Contraseña'
          secureTextEntry={true}
          placeholderTextColor='rgba(255,255,255,.6)'
          />
        </View>
        <View style={styles.btnContainers}>
          <TouchableOpacity onPress={this._handleSignUp}>
            <View style={styles.submitBtnContainer}>
              <Text style={styles.submitBtn}>{'Registrarme'.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
      </View>

    return (
      <Animatable.View
      animation={animation}
      style={styles.container}
      onAnimationEnd={this._handleAnimEnd}>
        <Text style={styles.title}>Registrarse</Text>
        {errorMessage}
        {signUpForm}
      </Animatable.View>
    )
  }

  _handleSignUp = () => {
    this.setState({errMsg: 'Registrandose...'})
    if (this.state.name.length < 5) {
      this.setState({errMsg: "Su nombre debe contener al menos 5 caracteres."})
    }
    else if (this.state.email.length == 0) {
      this.setState({errMsg: "Por favor entre su email."})
    }
    else if (this.state.password.length == 0) {
      this.setState({errMsg: "Por favor indique una contraseña."})
    }
    else {
      firebaseApp.database().ref('usernameList').child(this.state.name.toLowerCase()).once('value')
      .then((snapshot) => {
        if (snapshot.val()) {
          this.setState({ errMsg: "Usuario no disponible, favor escoger otro." })
        }
        else {
          firebaseApp.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
          .then((user) => {
            firebaseApp.database().ref('usernameList').child(this.state.name.toLowerCase()).set(user.uid)
            user.updateProfile({displayName: this.state.name})
            .then(() => {
              const countNumber = this.state.usersNumber+1
              firebaseApp.database().ref('users_count/counter/counting').set(countNumber)
            })
            .then(() => {
              const uid = user.uid
              const username = user.displayName
              const post_count = 0
              const chat_count = 0
              const order_count = 0
              const email = user.email
              const user_type = 0
              firebaseApp.database().ref('users/' + user.uid)
              .set({
                uid,
                username,
                post_count,
                chat_count,
                order_count,
                email,
                user_type,
              })
              this.props.appStore.username = user.displayName
              this.props.appStore.post_count = post_count
              this.props.appStore.order_count = order_count
              this.props.appStore.chat_count = chat_count
              this.props.appStore.user = user
              OneSignal.sendTag("username", user.displayName)
              OneSignal.sendTag("uid", user.uid)
              Actions.home({ type: 'replace' })
            }, function(error) {
              console.log(error);
            });
          })
          .catch((error) => {
            this.setState({ errMsg: error.message });
          })
        }
      })
    }
  }

  _handleGoBack = () => {
    this.setState({ init: false })
  }

  _handleBackBtnPress = () => {
    this._handleGoBack()
    return true
  }

  _handleAnimEnd = () => {
    if (!this.state.init) {
      this.props.onBackFromSignUp()
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 25,
    marginBottom: 10,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  errMsg: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 10,
    width: 280,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    backgroundColor: 'rgba(0,0,0,.3)',
    borderRadius: 5
  },
  inputField: {
    width: 280,
    height: 40,
    paddingLeft: 15,
    paddingRight: 15,
    color: '#fff'
  },
  btnContainers: {
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 280
  },
  submitBtnContainer: {
    width: 200,
    height: 40,
    backgroundColor: '#ddd',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitBtn: {
    fontSize: 18,
    fontWeight: '800',
    color: getColor()
  },
  showModal: {
    marginTop: 40,
    alignItems: 'center',
  }
})
