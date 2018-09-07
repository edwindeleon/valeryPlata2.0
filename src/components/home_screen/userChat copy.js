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
import StartChat from './startChat'
import StartedChat from './startedChat'
import { observer,inject } from 'mobx-react/native'


@inject("appStore") @observer
export default class UserChat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      previousChat:0,
    }
  }

  componentDidUpdate() {
    
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {
    
  }
  
  render() {
    const { uid } = firebaseAuth.currentUser
    firebaseApp.database().ref(`chatsList/${uid}`).once('value')
      .then((snapshot) => {
        if (snapshot.val()) {
          this.setState({ previousChat: 1 })
        }
      })  
        if (this.state.previousChat == 1) {
          return (
              <View style={styles.container2}>
                <StartedChat />
              </View>
          )
          
        }else{
          return (
            <View style={styles.container2}> 
              <StartChat />
            </View>
          )
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
  input: {
    height: 50,
    flex: 1
  }
});