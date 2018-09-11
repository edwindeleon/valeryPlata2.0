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
export default class Timeline extends Component {
  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      userId: 0,
      counter: 1,
      isLoading: true,
      isEmpty: false,
      isFinished: false,
      createdAt: '',
      postText: '',
      postTitle: '',
      postPrice: '',
      username: '',
      uid: '',
      puid: '',
      productType: null,
      image: '',
      imageHeight: null,
      imageWidth: null,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }
  }

  componentDidMount() {
    console.log("--------- TIMELINE --------- " + this.state.counter)
    firebaseApp.database().ref('global_chats').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
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
      <Text style={styles.titleTop}>{'LISTADO DE CHATS'}</Text>
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
    const timeString = moment(data.createdAt).fromNow()
    const height = screenWidth*data.imageHeight/data.imageWidth
    let theId = data.puid
    let preDesc = this.state.postText
    let dataDesc = data.text
    let _postText = ''
    preDesc == '' ? _postText = dataDesc : _postText = preDesc

    let preTitle = this.state.postTitle
    let dataTitle = data.title
    let _postTitle = ''
    preTitle == '' ? _postTitle = dataTitle : _postTitle = preTitle
    const shareOptions = {
      title: data.title + " Valery Plata",
      url: "https://play.google.com/store/apps/details?id=com.mardwin.valeryPlata",
      subject: "Instala la app de Valery Plata y disfruta de numerosas ofertas"
    }
    const BuyButton = (data.status === 'disponible') ?
            <TouchableOpacity style={styles.button} >
              <Icon name='md-heart' size={30} color='#eee'/>
            </TouchableOpacity>
          : null
    

        return (
          <View style={styles.card}>
            <View style={styles.postButtons}>
              
              <TouchableOpacity style={styles.button} onPress={() => this.removeItem(theId)}>
                  <Icon name='md-trash' size={20} color='#eee'/>
              </TouchableOpacity>
            </View>

            <Text style={styles.message}>{this.state.postStatus}</Text>
             
          
            <TouchableOpacity style={styles.button2} onPress={() => this._openChat(data)}>
              <View style={styles.postInfo}>
                <Text style={styles.title}>{ data.username }</Text>
                <Text style={styles.title}>{ data.email }</Text>
              </View>
            </TouchableOpacity>
           
          </View>
        )
      
      
  }
  removeItem(theId) {
    Alert.alert(
      'Eliminar Publicacion',
      'Realmente desea eliminar este Chat?',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Si', onPress: () => {
              firebaseApp.database().ref(`/global_chats/${theId}`).remove()
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
  _flagPost = (postData) => {
    console.log("--------> FLAG !!!!!!")
    console.log(postData)
    Alert.alert(
      'Flag Confirmation',
      'Are you sure you want to flag this item? If yes, a moderator will decide within 24 hours if this item should be removed.',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Yes', onPress: () => {

          fetch('https://onesignal.com/api/v1/notifications',
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': this.props.appStore.onesignal_api_key,
            },
            body: JSON.stringify(
            {
              app_id: this.props.appStore.onesignal_app_id,
              included_segments: ["All"],
              headings: {"en": "🏴🏴🏴🏴 Item flaged! 🏴🏴🏴🏴"},
              android_sound: "fishing",
              data: postData,
              big_picture: postData.image,
              ios_sound: "fishing.caf",
              contents: {"en": this.props.appStore.user.displayName + " just flaged: " + postData.title + " for " + postData.price},
              filters: [{"field":"tag","key":"username","relation":"=","value":"Herve f"}],
            })
          })
          .then((responseData) => {
            console.log("Push POST:" + JSON.stringify(responseData));
          })
          .done()

         } },
      ]
    )
  }

  _openChat = (postData) => {
    console.log(" *************** Opening CHAT ROOM *************** " + postData.uid);
    let userId = postData.uid
    this.props.appStore.userId = userId
    this.setState({ userId: userId })
    Actions.globalChat({ userId:postData.uid })
  }

  _BuyNow = (postData) => {
    Actions.chat({ title:postData.title, puid:postData.puid, wantToBuy:true })
  }

  _onEndReached = () => {
    //console.log("TIMELINE ----> _onEndReached :+++:");
    if (!this.state.isEmpty && !this.state.isFinished && !this.state.isLoading) {
      this.setState({ counter: this.state.counter + 1 })
      this.setState({ isLoading: true })
      firebaseApp.database().ref('global_chats').off()
      firebaseApp.database().ref('global_chats').orderByChild('createdAt').limitToLast(this.state.counter+1).on('value',
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
          <Text>Aun no hay chats.</Text>
        </View>
      )
    }
  }

  componentWillUnmount() {
    console.log("---- TIMELINE UNMOUNT ---")
    firebaseApp.database().ref('global_chats').off()
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
  button2: {
    flex: 3,
    padding: 5,
    margin: 6,
    alignItems: 'center',
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
