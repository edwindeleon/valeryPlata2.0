import React, { Component } from 'react'
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ListView,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
  Alert,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Share from 'react-native-share'
import { Actions } from 'react-native-router-flux'
import _ from 'lodash'
import moment from 'moment'
import { observer,inject } from 'mobx-react/native'
import { getColor } from '../config'
import { firebaseApp } from '../../firebase'
import firebase from 'firebase'


const screenWidth = Dimensions.get('window').width

@inject("appStore") @observer
export default class UsersList extends Component {
  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      counter: 1,
      isLoading: true,
      isEmpty: false,
      isFinished: false,
      usersNumber: 0,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }
  }

  componentDidMount() {
    console.log("--------- TIMELINE --------- " + this.state.counter)
    firebaseApp.database().ref('users').limitToLast(this.state.counter).on('value',
    (snapshot) => {
      console.log("---- TIMELINE POST RETRIEVED ---- "+ this.state.counter +" - "+ _.toArray(snapshot.val()).length)
      if (snapshot.val()) {
        this.setState({ isEmpty: false })
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))) })
      }
      else {
        this.setState({ isEmpty: true })
      }
      this.setState({ isLoading: false })
    })

    firebaseApp.database().ref(`users_count`).child(`counter`).on('value',
    (snapshot) => {
      let usersNumber = snapshot.val().counting
      this.setState({
        usersNumber: usersNumber
      });
      
    });
  }

  componentDidUpdate() {
    //LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
  }

  render() {
    let elCounter = this.state.counter
    return (
      
      <View style={styles.container}>
      <Text style={styles.titleTop}>{'LISTADO DE USUARIOS'}</Text>
      <Text style={styles.titleTop2}>{'Total de usuarios ' + this.state.usersNumber}</Text>
      <View style={styles.postInfo}>
              <Text style={styles.title}>{ this.state.usersNumber }</Text>

            </View>
        <ListView
          automaticallyAdjustContentInsets={false}
          initialListSize={1}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._onEndReached}
          onEndReachedThreshold={1}
        />
      </View>
    )
  }

  _renderRow = (data) => {

    
        return (
          <View style={styles.card}>
            <View style={styles.postInfo}>
              <Text style={styles.title}>{ data.username }</Text>

            </View>
            <View style={styles.postInfo}>
              <Text style={styles.test}>{ data.email }</Text>

            </View>
          </View>
        )
      
  }

  _onEndReached = () => {
    //console.log("TIMELINE ----> _onEndReached :+++:");
    if (!this.state.isEmpty && !this.state.isFinished && !this.state.isLoading) {
      this.setState({ counter: this.state.counter + 1 })
      this.setState({ isLoading: true })
      firebaseApp.database().ref('users').off()
      firebaseApp.database().ref('users').limitToLast(this.state.counter+1).on('value',
      (snapshot) => {
        this.setState({ isFinished: false })
        console.log("---- TIMELINE POST ON END RETRIEVED ---- "+ this.state.counter +" - "+ _.toArray(snapshot.val()).length)
        if (_.toArray(snapshot.val()).length < this.state.counter) {
          console.log("---- TIMELINE POST FINISHED ----");
          this.setState({ isFinished: true })
        }
        if (snapshot.val()) {
          this.setState({ isEmpty: false })
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))),
          })
        }
        this.setState({ isLoading: false })
      })
    }
  }

  _renderFooter = () => {
    if (this.state.isLoading) {
      return (
        <View style={styles.waitView}>
          <ActivityIndicator size='large'/>
        </View>
      )
    }
    if (this.state.isEmpty) {
      return (
        <View style={styles.waitView}>
          <Text>Nothing there yet.</Text>
        </View>
      )
    }
  }

  componentWillUnmount() {
    console.log("---- TIMELINE UNMOUNT ---")
    firebaseApp.database().ref('posts').off()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  waitView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  card: {
    flex: 1,
    margin:10,
    borderWidth: 1,
    borderColor: '#fe6dcd',
    borderBottomWidth: 1,
    shadowColor: '#fe6dcd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#666',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop:10,



  },
  titleTop: {
    marginTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    color: getColor()
  },
    titleTop2: {
    marginTop: 0,
    paddingBottom: 0,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    color: getColor()
  },
  message: {
    textAlign: 'center',
  },
  postImage: {
    backgroundColor: '#eee',
  },
  postInfo: {
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  postButtons: {
    padding: 5,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  button: {
    flex: 3,
    padding: 5,
    margin: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#fe6dcd',
    alignItems: 'center',
    backgroundColor: '#ff7fd4',
  },
  info: {
    fontSize: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
  titleContainer: {
    height: 40,
    width: 300,
    backgroundColor: 'rgba(255,255,255,.6)',
    marginBottom: 10,
    marginLeft: 10,
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
  inputContainer: {
    height: 140,
    width: 300,
    backgroundColor: 'rgba(255,255,255,.6)',
    marginBottom: 10,
    marginLeft: 10,
    marginTop: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 2,
  },

})
