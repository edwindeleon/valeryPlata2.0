import React, { Component } from 'react'
import {
  View,
  StatusBar,
  StyleSheet,
  Image,
  Text
} from 'react-native'
import ScrollableTabView from 'react-native-scrollable-tab-view2'
import { getColor } from '../components/config'
import NavigationTab from '../components/home_screen/navTab'
import Timeline from '../components/home_screen/timeline'
import Products from '../components/home_screen/products'
import CreateNew from '../components/home_screen/createNew'
import Profile from '../components/home_screen/profile'
import MyOrders from '../components/home_screen/myOrders'
import AdminSendNot from '../components/home_screen/adminSendNot'
import MyChats from '../components/home_screen/myChats'
import UsersList from '../components/home_screen/usersList'
import NotificationsList from '../components/home_screen/notificationsList'
import UserChat from '../components/home_screen/userChat'
import AdminUsersChat from '../components/home_screen/adminUsersChat'
import { firebaseApp } from '../firebase'
import { Actions } from 'react-native-router-flux'
import { observer, inject } from 'mobx-react/native'


@inject("appStore") @observer
export default class HomeScreen extends Component {
  constructor(props) {
    super(props)
    
    if (this.props.postProps) {
      console.log(" ------->>>> OPENING CHAT ROOM :::: " + this.props.postProps.puid)
      Actions.chat({ puid:this.props.postProps.puid })
    }

    _unsubscribe = firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log("--------- LOGGED IN HOME AS " + user.displayName + " ---------")
        this.props.appStore.user = user
        this.props.appStore.username = user.displayName

        firebaseApp.database().ref('users').child(user.uid).once('value')
        .then((snapshot) => {
          
          this.props.appStore.user_type = parseInt(snapshot.val().user_type)

          console.log("--------- HOME usertype login screen AS " + this.props.appStore.user_type + " ---------")
        })
        
        
      }
      
      _unsubscribe()
    })
    
  }

  componentWillMount() {
    console.log("--------- HOME ---------");
    this.props.appStore.tracker.trackScreenView('Home')
    this.props.appStore.current_page = 'home'
    this.props.appStore.current_puid = ''    
        
  }
  componentDidMount() {
    
  }


  render() {
    
    if (this.props.appStore.user_type ==1) {
      return (
        <View style={styles.container}>
          
          <StatusBar
          backgroundColor={getColor('googleBlue700')}
          barStyle='light-content'
          animated={true}
          />

          <ScrollableTabView
          initialPage={0}
          style={{borderTopWidth:0}}
          renderTabBar={() => <NavigationTab />}>
            <Timeline tabLabel="tags" />
            <Products tabLabel="diamond-1"/>
            <CreateNew tabLabel="plus"/>
            <AdminSendNot tabLabel="comment"/>
            <MyOrders tabLabel="heart"/>
            <NotificationsList tabLabel="bell-alt"/>
            <AdminUsersChat tabLabel="comment-alt"/>
            <UsersList tabLabel="users"/>
            <Profile tabLabel="user"/>
          </ScrollableTabView>
        
        </View>
      )
    }
    else{
      return (
        <View style={styles.container}>
        
          <StatusBar
          backgroundColor={getColor('googleBlue700')}
          barStyle='light-content'
          animated={true}
          />

          <ScrollableTabView
          initialPage={0}
          style={{borderTopWidth:0}}
          renderTabBar={() => <NavigationTab />}>
            <Timeline tabLabel="tags" />
            <Products tabLabel="diamond-1"/>
            <MyOrders tabLabel="heart"/>
            <NotificationsList tabLabel="bell-alt"/>
            <UserChat tabLabel="comment-alt"/>
            <Profile tabLabel="user"/>
          </ScrollableTabView>
        
        </View>
      )
    }
  }

  componentWillUnmount() {
    console.log("---- HOME UNMOUNT ---")
    this.props.appStore.current_page = ''
    this.props.appStore.current_puid = ''
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  
})
