import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import { StackNavigator } from 'react-navigation'
import AfterLoginHome from './AfterLoginHome'
import MyInformation from './MyInformation'
import MenuView from './MenuView'
import FaqView from './FaqView'
import UploadFileView from './UploadFileView'
import EditProfile from './EditProfile'
import * as UserActions from '../actions/UserActions'
import * as WalletHelpers from '../utils/WalletHelpers'

// navigator for after login
const AfterLoginNav = StackNavigator({
  AfterLoginHome: {
    screen: AfterLoginHome,
    navigationOptions: {
      header: null,
      headerBackTitle: 'Back',
      headerTintColor: white,
      headerStyle: {
        backgroundColor: hydraPink,
      }
    }
  },
  MyInformation: {
    screen: MyInformation,
    navigationOptions: {
      // title: 'title',
      headerBackTitle: 'Back',
      headerTintColor: white,
      headerStyle: {
        backgroundColor: hydraPink,
      }
    }
  },
  FaqView: {
    screen: FaqView,
    navigationOptions: {
      // title: 'FAQ',
      headerBackTitle: 'Back',
      headerTintColor: white,
      headerStyle: {
        backgroundColor: hydraPink,
      }
    }
  },
  UploadFileView: {
    screen: UploadFileView,
    navigationOptions: {
      headerBackTitle: 'Back',
      headerTintColor: white,
      headerStyle: {
        backgroundColor: hydraPink,
      }
    }
  },
  EditProfile: {
    screen: EditProfile,
    navigationOptions: {
      headerBackTitle: 'Back',
      headerTintColor: white,
      headerStyle: {
        backgroundColor: hydraPink,
      }
    }
  },
})

class AfterLoginRoot extends Component {

  // check HNT token balance at componentDidMount
  componentDidMount () {
    this._checkHNTTokanBalance()
  }

  // check HNT token balance
  _checkHNTTokanBalance = () => {

    const { wallet, web3 } = this.props
    const addresses = wallet.getAddresses()
    address = addresses[0]

    const params = {
      web3: web3,
      address: address,
    }
    WalletHelpers.checkTokenBalance(params)
    .then((results) => {
      const params = {
        hnt_balance: parseInt(results, 10)
      }
      this.props.setHNTBalance(params)
    })
    .then(() => {
      const params = {
        web3: web3,
        address: address,
      }
      return WalletHelpers.checkUserStatus(params)
    })
    .then((results) => {
      console.log("checkUserStatus:", results)
      const params = {
        userStatus: parseInt(results.status)
      }
      this.props.setUserStatus(params)
    })
    .catch((err) => {
      console.log("err:", err)
    })
  }

  // this called at screen switch
  _onNavigationStateChange = (revState, newState, action) => {
    if ( newState.index === 0 ){
      this._checkHNTTokanBalance()
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <AfterLoginNav onNavigationStateChange={this._onNavigationStateChange}/>
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
      hnt_balance: user.hnt_balance,
    }
  } else {
    return {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setHNTBalance: (data) => dispatch(UserActions.setHNTBalance({ params: data})),
    setUserStatus: (data) => dispatch(UserActions.setUserStatus({ params: data})),
  }
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(AfterLoginRoot)
