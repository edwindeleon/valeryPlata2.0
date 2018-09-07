import React, { Component } from 'react';
 
import { StyleSheet, View, Alert, ListView, Text, TouchableOpacity, Image } from 'react-native';
 
import Comment from './Comment'
import { observer,inject } from 'mobx-react/native'

@inject("appStore") @observer
export default class CommentList extends Component {
  
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => {
      r1 !== r2
    }})
    this.state = {
      dataSource: ds,
      
    }
  }

  componentDidMount() {
    this.updateDataSource(this.props.comments)
    

    
  }

  componentWillReceiveProps(newProps) {
    if (newProps.comments !== this.props.comments) {
      this.updateDataSource(newProps.comments)
      
      
    }
    
  }

  updateDataSource = (data) => {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data)
    })
    
  }
 componentDidUpdate(prevProps, prevState, snapshot){
  
 }

 
render() {
 
return (
 
<View style={styles.MainContainer}>
        <ListView
        enableEmptySections={true}
        dataSource={this.state.dataSource}
        renderRow={(comment) => {
          return <Comment text={comment.text} avatar={comment.userPhoto} userType={comment.theType} />
        }}
        onTextChange={() => {this.refs.ListView_Reference.scrollToEnd({animated: true})}}
        ref='ListView_Reference'
      /> 
 
   
</View>
           
   );
 }
}
 
const styles = StyleSheet.create({
 
 MainContainer :{
 
   justifyContent: 'center',
   flex:1,
   margin: 10,
 },
 
 rowViewContainer: 
 {
 
   fontSize: 18,
   paddingRight: 10,
   paddingTop: 10,
   paddingBottom: 10,
 
 },
 
 topButton:{
  
     position: 'absolute',
     width: 50,
     height: 50,
     alignItems: 'center',
     justifyContent: 'center',
     right: 30,
     bottom: 70,
},
  
   topButton_Image: {
  
     resizeMode: 'contain',
     width: 30,
     height: 30,
},

bottomButton:{
  
  position: 'absolute',
  width: 50,
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
  right: 30,
  bottom: 30,
},

bottomButton_Image: {

  resizeMode: 'contain',
  width: 30,
  height: 30,
}
});