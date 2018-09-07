import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image
} from 'react-native'
import { getColor } from '../config'
import { observer, inject } from 'mobx-react/native'
import { createIconSetFromFontello } from 'react-native-vector-icons'


let fontelloConfig = require('../../assets/fontello/config.json')
let Icon = createIconSetFromFontello(fontelloConfig)


@inject("appStore") @observer
export default class NavigationTab extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <TouchableOpacity>
            <Image source={require('../../assets/images/logoNombre.png')} style={styles.logoImage} />
          </TouchableOpacity>
        </View>
        
          <View style={styles.tabs}>

            {this.props.tabs.map((tab, i) => {
              return (
                <TouchableOpacity key={tab} onPress={() => this.props.goToPage(i)} style={styles.tab}>
                    {
                      //( tab === 'md-chatbubbles') ?
                      //<View style={styles.badgeContainer}><Text style={styles.counter}>3</Text></View>
                      //: null
                    }
                    
                    <Icon
                      name={tab}
                      size={30}
                      color={ this.props.activeTab === i ?
                        getColor('#ffffff') : ( (tab === 'chat' && this.props.appStore.new_messages > 0) ? getColor('rgba(0,255,0,.4)') : getColor('rgba(255,255,255,.4)')) }
                    />
                </TouchableOpacity>
              )
            })}
              
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('googleBlue500'),
    elevation: 5,
    height: 130,
  },
  tabs: {
    height: 50,
    paddingTop: 20,
    flexDirection: 'row',
    
  },
  tab: {
    flex: 4,
    //borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //borderWidth: 1,
    left: 16,
    top: 10,
    height: 15,
    width: 15,
    borderRadius: 90,
    //marginRight: 25,
    backgroundColor: 'red',
  },
  tabContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //position: 'absolute',
  },
  counter: {
    fontSize: 10,
    fontWeight: '200',
    color: '#FFF',
  },
 
  logoImage : {
    height: 50,
    width: 220,
  },
  
})
