import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ListView,
  LayoutAnimation,
  Platform,
  UIManager,
  
} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import { firebaseApp } from '../../firebase'
import Icon from 'react-native-vector-icons/Ionicons'
import ModalPicker from 'react-native-modal-picker'
import { getColor } from '../config'
import { observer,inject } from 'mobx-react/native'
import { Actions } from 'react-native-router-flux'
import call from 'react-native-phone-call'

const args = {
  number: '8299238238', // String value with the number to call
  prompt: false // Optional boolean property. Determines if the user should be prompt prior to the call 
}

const args2 = {
  number: '8095379837', // String value with the number to call
  prompt: false // Optional boolean property. Determines if the user should be prompt prior to the call 
}

@inject("appStore") @observer
export default class Profile extends Component {
  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      isLoading: true,
      isFinished: false,
      counter: 10,
      isEmpty: false,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }
  }

  componentDidMount() {
    const uid = this.props.appStore.user.uid
    console.log("--------- MY POSTS --------- " + uid)
    firebaseApp.database().ref('user_posts/'+ uid +'/posts').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
    (snapshot) => {
      console.log("USER POST RETRIEVED");
      if (snapshot.val()) {
        this.setState({ isEmpty: false })
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))),
        })
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
        <View style={styles.profileInfoContainer}>
          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>
              {this.props.appStore.username}
            </Text>
          </View>
          
          <View style={styles.profileCountsContainer}>
            <TouchableOpacity onPress={this._userEdit}>
              <Icon name='md-settings' size={30} color='rgba(255,255,255,.9)'/>
            </TouchableOpacity>
          </View>
          <View style={styles.profileCountsContainer}>
            <TouchableOpacity onPress={this._logOut}>
              <Icon name='md-log-out' size={30} color='rgba(255,255,255,.9)'/>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.titleTop}>{'SOBRE ESTA APLICACIóN'.toUpperCase()}</Text>
        <Text style={styles.copy}>V 1.4</Text>
        <Text style={styles.copy}>Joyería Valery Plata </Text>
        <Text style={styles.copy2}>Av. 27 de Febrero casi esq. Nuñez de Cáceres, Plaza Dominica</Text>
        <TouchableOpacity onPress={this._llamar2}><Text style={styles.copyTel}>809-537-9837</Text></TouchableOpacity>
       

       <Text style={styles.copy}>Diseño y Desarrollo de la App: Edwin De León </Text>
        <TouchableOpacity onPress={this._llamar}><Text style={styles.copyTel}>829-923-8238</Text></TouchableOpacity>
      </View>
    )
  }
  _llamar = () => {
    call(args).catch(console.error)
  }
  _llamar2 = () => {
    call(args2).catch(console.error)
  }
  _renderRow = (data) => {
    let index = 0;
    const options = [
        { key: index++, section: true, label: 'Status' },
        { key: index++, label: 'disponible' },
        { key: index++, label: 'no disponible' },
    ]
    const timeString = moment(data.updatedAt).fromNow()
    const Status = (data.status === 'available') ? <Text style={{fontWeight:'bold',color:"green"}}>DISPOBIBLE</Text> : <Text style={{fontWeight:'bold',color:"red"}}>NO DISPOBIBLE</Text>
    return (
      <TouchableOpacity onPress={() => this._openChat(data)}>
        <View style={styles.card}>
          <View style={styles.RawContainer}>
            <View style={styles.LeftContainer}><Text style={styles.title}>{ data.title }</Text></View>
          </View>
          <View style={styles.RawContainer}>
            <View style={styles.LeftContainer}><Text style={styles.info}>{ data.price }</Text></View>
            <View style={styles.RightContainer}>
              <ModalPicker data={options} onChange={ (option)=>this._changeStatus(option, data) }>
                { Status }
              </ModalPicker>
            </View>
          </View>
          <View style={styles.RawContainer}>
            <Text style={styles.info}>{timeString}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _userEdit = () => {
    Actions.setting()
  }
  _changeStatus = (option, postData) => {
    console.log("NEW STATUS: " + option.label)
    firebaseApp.database().ref('posts').child(postData.puid).update( { status:option.label } )
    firebaseApp.database().ref('user_posts/'+postData.uid+'/posts').child(postData.puid).update( { status:option.label } )
    if (postData.clientId) {
      firebaseApp.database().ref('user_orders/'+postData.clientId+'/posts').child(postData.puid).update( { status:option.label } )
      firebaseApp.database().ref('posts').child(postData.puid).update( { clientId:"",clientName:"" } )
    }
  }

  _onEndReached = () => {
    if (!this.state.isEmpty && !this.state.isFinished && !this.state.isLoading) {
      this.setState({ counter: this.state.counter + 10 })
      this.setState({ isLoading: true })
      firebaseApp.database().ref('user_posts/'+ this.props.appStore.user.uid +'/posts').off()
      firebaseApp.database().ref('user_posts/'+ this.props.appStore.user.uid +'/posts').orderByChild('createdAt').limitToLast(this.state.counter+10).on('value',
      (snapshot) => {
        console.log("---- USER POST RETRIEVED ----");
        if (_.toArray(snapshot.val()).length < this.state.counter) {
          this.setState({ isFinished: true })
          console.log("---- USER POST FINISHED !!!! ----")
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
          <Text>- Here will be the list of the items you are selling and sold -</Text>
        </View>
      )
    }
  }

  _openChat = (postData) => {
    Actions.chat({ title:postData.title, puid:postData.puid })
  }

  _user = () => {
    Actions.setting()
  }

  _logOut = () => {
    firebaseApp.auth().signOut()
    .then(() => {
      this.props.appStore.username = ""
      this.props.appStore.user = {}
      this.props.appStore.post_count = 0
      this.props.appStore.chat_count = 0
      this.props.appStore.order_count = 0
      Actions.login({ type: 'replace' });
    }, function(error) {
      console.log(error)
    });
  }

  componentWillUnmount() {
    firebaseApp.database().ref('user_posts/'+ this.props.appStore.user.uid +'/posts').off()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  profileInfoContainer: {
    flexDirection: 'row',
    height: 65,
    margin: 5,
    borderRadius: 2,
    backgroundColor: getColor()
  },
  profileNameContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  profileName: {
    marginLeft: 10,
    fontSize: 20,
    color: '#fff',
  },
  profileCountsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5
  },
  profileCounts: {
    fontSize: 30,
    color: '#fff'
  },
  countsName: {
    fontSize: 12,
    color: '#ffffff'
  },
  waitView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  card: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#999',
    margin: 2,
  },
  RawContainer: {
    flexDirection: 'row',
    flex: 1,
    //borderWidth: 1,
    marginLeft: 5,
  },
  LeftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    //borderWidth: 1,
  },
  RightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 10,
    padding: 10,
    //borderWidth: 1,
    //backgroundColor:'#000',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
    color: '#444',
  },
  titleTop: {
    marginTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    color: getColor()
  },
  copy: {
    marginTop: 10,
    paddingBottom: 0,
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'center',
    color: '#444'
  },
  copy2: {
    marginTop: 0,
    paddingBottom: 0,
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'center',
    color: '#444'
  },
  copyTel: {
    marginTop: 5,
    paddingBottom: 10,
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'center',
    color: getColor()
  },
  info: {
    padding: 3,
    fontSize: 13,
  },
})
