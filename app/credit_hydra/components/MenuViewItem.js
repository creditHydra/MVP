import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import Icon from 'react-native-fa-icons';

// item on mane view screen
class MenuViewItem extends Component {

  _linkPressed = () => {

    const { item } = this.props
    const url = item.value

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  }

  render() {

    const { item } = this.props

    return (
      <View style={[styles.container, {
          borderBottomColor: '#cccccc',
          borderBottomWidth: 1,
          borderStyle: 'solid',
        }]}>


        {item.type === 'text2' ? (

          <View style={{
            flexDirection: 'column'
          }}>
            <Text style={{
                color: hydraPink,
                marginLeft: 20,
              }}>{item.key}</Text>

            <Text style={{
                marginTop: 4,
                marginLeft: 20,
              }}>{item.value}</Text>

          </View>

        ) : (
          <View style={[styles.container, {
            flexDirection: 'row',
            justifyContent: 'space-between',
          }]}>
            <Text style={{
                color: hydraPink
              }}>{item.key}</Text>

            {item.type === 'text1' && (
              <Text>{item.value}</Text>
            )}

            {item.type === 'link' && (
              <TouchableOpacity onPress={this._linkPressed}>
                <Icon name='external-link' style={{
                    fontSize: 20,
                    color: '#cccccc',
                    justifyContent: 'flex-end',
                    marginTop: 2,
                  }} />
              </TouchableOpacity>
            )}

          </View>
        )}

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
)(MenuViewItem)
