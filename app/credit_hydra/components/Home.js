import React from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux'
import { getWalletFromStorage, getProfileFromStorage } from '../utils/StorageHelpers'
import { setWeb3Provider } from '../utils/WalletHelpers'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import BeforeLoginRoot from './BeforeLoginRoot'
import CreateProfile from './CreateProfile'
import * as UserActions from '../actions/UserActions'
import AfterLoginRoot from './AfterLoginRoot'
import { hydraPink } from '../utils/colors'

// status bar
function UdaciStatusBar ({backgroundColor, ...props}) {
  return (
    <View style={{
        backgroundColor,
        height: getStatusBarHeight()
      }}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
  )
}

// index.js > app.js > home.js
class Home extends React.Component {

  // try to get data from local storage
  componentDidMount () {

    let newWallet
    let newWeb3

    // try to retrieve
    getWalletFromStorage()
    .then((results) => {
      // prepare web3
      if (!results){
        return Promise.reject(Error("no wallet found"))
      }

      newWallet = results

      // set web3
      const params = {
        wallet: newWallet
      }
      return setWeb3Provider(params)
    })
    .then((results) => {

      // set web3 on props
      newWeb3 = results.web3
      const params = {
        web3: newWeb3
      }
      this.props.setWeb3(params)
    })
    .then(() => {

      // set keystore on props
      const params = {
        wallet: newWallet,
      }
      this.props.setKeystore(params)
    })
    .then(() => {
      // get profile from storage
      return getProfileFromStorage();
    })
    .then((results) => {
      // set profile

      if (results) {
        const params = {
          profile: results,
        }
        this.props.setProfile(params)
      }

      this.props.setReady({})
    })
    .catch((err) => {

      this.props.setReady({})

      console.log("err:", err)
    })
  }

  render() {

    // user has not logged in
    const { wallet, web3, profile, userStatus, userReady } = this.props

    if (userReady !== true){
      return (
        <View>
          <Text>
            Loading...
          </Text>
        </View>
      )
    }

    if (wallet && web3 && profile && profile.name ){
      // already profile created
      return (
        <View style={{flex: 1}}>
          <UdaciStatusBar backgroundColor={hydraPink} barStyle="light-content" />
          <AfterLoginRoot />
        </View>
      );
    }

    if (wallet && web3) {
      // already phone number is verified
      return (
        <View style={{flex: 1}}>
          <UdaciStatusBar backgroundColor={hydraPink} barStyle="light-content" />
          <CreateProfile />
        </View>
      );
    }

    return (
      <View style={{
          flex: 1,
        }}>
        <UdaciStatusBar backgroundColor={hydraPink} barStyle="light-content" />
        <BeforeLoginRoot />
      </View>
    );
  }
}

function mapStateToProps ({ user }) {

  if (user){
    return {
      wallet: user.wallet,
      web3: user.web3,
      account_password: user.account_password,
      profile: user.profile,
      userStatus: user.userStatus,
      userReady: user.ready,
    }
  } else {
    return {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setKeystore: (data) => dispatch(UserActions.setKeystore({ params: data})),
    setWeb3: (data) => dispatch(UserActions.setWeb3({ params: data})),
    setPassword: (data) => dispatch(UserActions.setPassword({ params: data})),
    setProfile: (data) => dispatch(UserActions.setProfile({ params: data})),
    setReady: (data) => dispatch(UserActions.setReady({ params: data})),
  }
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(Home)
