import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import { StackNavigator } from 'react-navigation'
import VerifyPhoneNumber from './VerifyPhoneNumber'
import FaqView from './FaqView'

// navigator for before login
const BeforeLoginNav = StackNavigator({
  VerifyPhoneNumber: {
    screen: VerifyPhoneNumber,
    navigationOptions: {
      header: null,
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
      // header: null,
      headerBackTitle: 'Back',
      headerTintColor: white,
      headerStyle: {
        backgroundColor: hydraPink,
      }
    }
  },
})

class BeforeLoginRoot extends Component {

  render() {
    return (
      <View style={{flex: 1}}>
        <BeforeLoginNav />
      </View>
    );
  }
}

// function mapStateToProps ({ user }) {
//
//   if (user) {
//     return {
//       user: user.user,
//       login_token: user.login_token,
//       ready: user.ready,
//     }
//   } else {
//     return {}
//   }
// }

// function mapDispatchToProps (dispatch) {
//   return {
//     mapDispatchLoadSavedDecks: (data) => dispatch(loadSavedDecks({ params: data})),
//   }
// }

export default connect(
  null, null
)(BeforeLoginRoot)
