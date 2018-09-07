import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text
} from 'react-native';
import { observer,inject } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/Ionicons'

import { getColor } from '../config'
import { firebaseApp, firebaseAuth, firebaseDatabase } from '../../firebase'
import firebase from 'firebase'
import CommentList from './CommentList'

@inject("appStore") @observer
export default class StartedChat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      comments: []
    }
  }
  
  getArtistRef = () => {
    const { uid } = firebaseAuth.currentUser
    
    return firebaseDatabase.ref(`chats/${uid}`)
    
  }
  handleSend = () => {
    const { text } = this.state
    const { uid, photoURL } = firebaseAuth.currentUser
    const artistCommentsRef = this.getArtistCommentsRef()
    const theCurrentName = this.props.appStore.username

    var newCommentRef = artistCommentsRef.push()
    newCommentRef.set({
      text,
      uid
    })
    this.setState({ text: '' })
    
   // this.newComment()
  }

  //newComment = () => {
  //  this.getArtistRef().transaction(function (comments) {
  //    if (comments) {
  //      if (comments.commentCount) {
  //        comments.commentCount++;
  //      } else {
  //        comments.commentCount = 1;
  //      }
  //      
  //    }
  //    return comments || {
  //      commentCount: 1
  //    }
  //  })
  //}

  getArtistCommentsRef = () => {
    const { uid } = firebaseAuth.currentUser
    return firebaseDatabase.ref(`chats/${uid}`)
  }

  handleChangeText = (text) => this.setState({text})

  componentDidMount() {
    this.getArtistCommentsRef().on('child_added', this.addComment)

    this.getArtistCommentsRef().once('value', snapshot => {
      let comments = {comments:[]}
      snapshot.forEach( comment => {
        comments.comments = comments.comments.concat(comment.val())
      })
      this.setState({
        comments: comments.comments
      })
    })  
  }

  addComment = (data) => {
    const comment = data.val()
    this.setState({
      comments: this.state.comments.concat(comment)
    })
  }

  componentWillUnmount() {
    this.getArtistCommentsRef().off('child_added', this.addComment)
  }
  
  render() {
    const artist = this.props.artist
    const { comments } = this.state

    return (
      <View style={styles.container}>
        
        <CommentList comments={comments} />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={this.state.text}
            placeholder="Escribir mensaje..."
            onChangeText={this.handleChangeText}
          />
          <TouchableOpacity onPress={this.handleSend}>
            <Icon name="ios-send-outline" size={30} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgray',
    paddingTop: 10,
  },
  inputContainer: {
    height: 50,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    height: 50,
    flex: 1
  }
});