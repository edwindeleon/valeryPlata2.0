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
export default class notificationsList extends Component {
  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      counter: 5,
      createdAt: '',
      postText: '',
      postTitle: '',
      
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }
  }

  componentDidMount() {
    console.log("--------- TIMELINE --------- " + this.state.counter)
    firebaseApp.database().ref('push_notifications').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
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
  }

  componentDidUpdate() {
    //LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
  }

  render() {
    return (
      <View style={styles.container}>
      <Text style={styles.titleTop}>{'NOTIFICACIONES'}</Text>
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
    //console.log("TIMELINE :::: _renderRow " + data.title)
    //const timeString = moment(data.createdAt).fromNow()
    const timeString = moment.utc(data.createdAt).toDate();
    const local = moment(timeString).local().format('DD-MM-YYYY hh:mm A');
    let theId = data.puid
    
        return (
          <View style={styles.card}>
            
                
                <View style={styles.postInfo}>
                  <Text style={styles.title}>{ data.title}</Text>

                </View>
                <View style={styles.postInfo}>
                  <Text>{ local }</Text>

                </View>
                
                <View style={styles.postInfo}>
                  { data.text ? <Text style={styles.info}>{ data.text }</Text> : null }
                </View>

          </View>
        )
  }
  removeItem(theId) {
    Alert.alert(
      'Eliminar Publicacion',
      'Realmente desea eliminar esta Publicacion?',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Si', onPress: () => {
              firebaseApp.database().ref(`/posts/${theId}`).remove()
            }
          }
        
      ]
    )
  }
  _handleNewPost2 = () => {
    this.setState({
      postStatus: 'Modificando producto...',
      spinnervisible: true
    })    
          const prodId = this.state.puid
          
            const postData = {
              createdAt: this.state.createdAt,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
              text: this.state.postText.replace(/(\r\n|\n|\r)/gm,""),
              title: this.state.postTitle,
              price: this.state.price,
              username: this.state.username,
              uid: this.state.uid,
              status: "disponible",
              clientId: "",
              clientName: "",
              new_messages: 0,
              productType: 2,
              puid: prodId,
              image: this.state.image,
              imageHeight: this.state.imageHeight,
              imageWidth: this.state.imageWidth,
              
            }
            let updates = {}
            updates['/posts/' + prodId] = postData
            
            firebaseApp.database().ref().update(updates)
            .then(() => {
              this.setState({
                              postStatus: 'Producto guardado correctamente!',
                              postTitle: '',
                              postPrice: '',
                              postText: '',
                              productType: null,
                              imagePath: null,
                              imageHeight: null,
                              imageWidth: null,
                              spinnervisible: false,
                            })
              setTimeout(() => {
                this.setState({ postStatus: null })
              }, 3000)
            })

            .catch(() => {
              this.setState({ postStatus: 'Something went wrong!!!' })
              this.setState({ spinnervisible: false })
            })
          

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
          <Text>No hay notificaciones aun...</Text>
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
