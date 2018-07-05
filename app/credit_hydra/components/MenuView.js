import React, { Component } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import MenuViewItem from './MenuViewItem'

// screen for hamburger menu
class MenuView extends Component {

  renderItem = ({ item }) => {
    return (
      <MenuViewItem item={item} />
    )
  }

  menuList = [
    {
      _id: 1,
      key: 'What is Credit Hydra project?',
      value: 'We are developing a decentralized Credit Bureau on Ethereum and Swarm, which transfers data ownership to the actual owner.',
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
      key: 'Terms and Conditions',
      value: 'https://credithydra.com/',
      type: 'link',
    },
    {
      _id: 4,
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
          data={this.menuList}
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

// function mapStateToProps ({ user }) {
//
//   if (user){
//     return {
//       wallet: user.wallet,
//       web3: user.web3,
//       account_password: user.account_password,
//       profile: user.profile,
//     }
//   } else {
//     return {}
//   }
// }

// function mapDispatchToProps (dispatch) {
//   return {
//     setKeystore: (data) => dispatch(setKeystore({ params: data})),
//     setWeb3: (data) => dispatch(setWeb3({ params: data})),
//     setPassword: (data) => dispatch(setPassword({ params: data})),
//   }
// }

export default connect(
  null, null
)(MenuView)
