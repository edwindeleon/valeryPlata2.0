import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
  StyleSheet,
  Image
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { firebaseApp } from '../firebase'
import { observer, inject } from 'mobx-react/native'

import OneSignal from 'react-native-onesignal'


@inject("appStore") @observer
export default class LoginScreen extends Component {
  

  componentWillUnmount() {
  }

  componentWillMount() {
    
  }

  componentDidMount() {
  }

  componentDidUpdate() {
    
  }

  render() {
  
    return (
      <View style={styles.container}>
        <View style={styles.rowcontainer}>
          
          <Text>Valery Plata Login desde el componente 2</Text>
        </View>
      </View>
    )
  }

  _onLogoClicked = () => {
    this.setState({
      initialScreen: true,
      signIn: false,
      signUp: false,
      forgotPass: false
    })
  }

  _onSignIn = () => {
    this.setState({
      initialScreen: false,
      signIn: true
    })
  }

  _onBackFromSignIn = () => {
    this.setState({
      initialScreen: true,
      signIn: false
    })
  }

  _onSignUp = () => {
    this.setState({
      initialScreen: false,
      signUp: true
    })
  }

  _onBackFromSignUp = () => {
    this.setState({
      initialScreen: true,
      signUp: false
    })
  }

  _onForgotPass = () => {
    this.setState({
      initialScreen: false,
      signIn: false,
      signUp: false,
      forgotPass: true
    })
  }

  _onBackFromForgotPass = () => {
    this.setState({
      initialScreen: true,
      forgotPass: false
    })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowcontainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage : {
    height: 220,
    width: 220,
  },
})
