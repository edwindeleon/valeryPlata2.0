import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Router, Scene, Actions, Stack } from 'react-native-router-flux'
import { Provider } from 'mobx-react/native'
import codePush from 'react-native-code-push'
import OneSignal from 'react-native-onesignal'
import HomeScreen from './views/home_screen'
import LoginScreen from './views/login_screen'
import SettingScreen from './views/setting_screen'
import ChatScreen from './views/chat_screen'
import AdminStartedChat from './components/home_screen/adminStartedChat'
import appStore from './store/AppStore'

React.PropTypes = PropTypes;
class App extends Component {

  componentDidMount() {
    console.log("-------xx------ App - componentDidMount ------xx-------")
    OneSignal.inFocusDisplaying(0)
    OneSignal.configure({
      onNotificationReceived: function(notification) {
        //console.log('NOTIFICATION RECEIVED: ', notification)
        if (notification.payload.additionalData.new_message && appStore.current_puid != notification.payload.additionalData.puid) {
          console.log("       appStore.new_messages + 1 : " + appStore.current_puid)
          appStore.new_messages = appStore.new_messages + 1
        }
      },
      onNotificationOpened: function(openResult) {
        console.log(openResult);
        console.log('MESSAGE: ', openResult.notification.payload.body)
        console.log('CURRENT PUID:' + appStore.current_pui)
        console.log('ISACTIVE: ', openResult.notification.isAppInFocus)
        console.log('DATA: ', openResult.notification.payload.additionalData)
        if (!openResult.notification.isAppInFocus) {
          if (openResult.notification.payload.additionalData) {
            if (appStore.current_puid != openResult.notification.payload.additionalData.puid) {
              Actions.login({ type: 'replace', postProps:openResult.notification.payload.additionalData })
            }
          }
          else {
            Actions.login({ type: 'replace', postProps:null })
          }
        }
      }
    })
  }
  render() {
    console.disableYellowBox = true
    return (
      <Provider appStore={appStore}>
        <Router>
          <Stack key="root">
            <Scene
              key="login"
              component={LoginScreen}
              duration={1}
              hideNavBar
              initial
            />
            <Scene
              key="home"
              component={HomeScreen}
              duration={1}
              hideNavBar
            />
            <Scene
            key="chat"
            component={ChatScreen}
            //direction="vertical"
            hideNavBar={false}
            panHandlers={null}
            duration={0}
          />
          <Scene
            key="globalChat"
            component={AdminStartedChat}
            //direction="vertical"
            hideNavBar={false}
            panHandlers={null}
            duration={0}
          />
          <Scene
            key="setting"
            component={SettingScreen}
            hideNavBar={false}
            title="Editar Perfil"
            panHandlers={null}
            duration={0}
          />
          </Stack>
        </Router>
      </Provider>
    )
  }
}

let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };
export default App = codePush(codePushOptions)(App)