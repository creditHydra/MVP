import React, { Component } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import FaqViewItem from './FaqViewItem'

// screen for hamburger menu
class FaqView extends Component {

  renderItem = ({ item }) => {
    return (
      <FaqViewItem item={item} />
    )
  }

  faqList = [
    {
      _id: 1,
      key: 'What is Credit Hydra project?',
      value: 'We are developing a decentralized Credit Bureau on blockchain, which transfers data ownership to the actual owner.',
      type: 'text2',
    },
    {
      _id: 2,
      key: 'What is HNT token?',
      value: 'HNT token is utility currency on Credit Hydra eco system.',
      type: 'text2',
    },
    {
      _id: 3,
      key: 'How to get HNT token?',
      value: 'You can get 10 token by creating your account. You can get 13 more token when your identity  is verified. But you need to spend 3 token to request verification. So once you complete your identify verification, you will get 20 token.',
      type: 'text2',
    },
    {
      _id: 4,
      key: 'How to create an account?',
      value: '3 steps. First, you need to verify your phone number. then, you need to set your name and profile photo. And last step is to set your password. That\'s it',
      type: 'text2',
    },
    {
      _id: 5,
      key: 'What else I can do with HNT token?',
      value: 'Once you completed identity verification, you are good now. You will be able to use your identity to access lending in the future. We will also add many more ways to get ant use token down the load. But don\'t delete Credit Hydra app because if you delete your app, you will lose your token and there is no way to recover the token.',
      type: 'text2',
    },
    {
      _id: 6,
      key: 'Terms and Conditions',
      value: 'https://credithydra.com/',
      type: 'link',
    },
    {
      _id: 7,
      key: 'App Version',
      value: '0.0.1',
      type: 'text1',
    },
  ]

  render() {

    return (
      <View style={styles.container}>

        <FlatList
          style={{flex: 1}}
          data={this.faqList}
          renderItem={this.renderItem}
          keyExtractor={item => item._id}
        />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: white
  },
  iosSubmitLoginBtn: {
    backgroundColor: hydraPink,
    padding: 10,
    borderRadius: 7,
    height: 45,
    width: '100%',
    marginLeft: 40,
    marginRight: 40,
    marginTop:5,
    marginBottom:25,
  },
  AndroidSubmitLoginBtn: {
    backgroundColor: hydraPink,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    height: 45,
    width: '100%',
    borderRadius: 2,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: 'center',
  },
})

export default connect(
  null, null
)(FaqView)
