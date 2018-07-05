import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import firebase from 'react-native-firebase';
import Spinner from 'react-native-loading-spinner-overlay';

// screen for phone number input. we send it to Firebase for phone number authentication
class InputPhoneNumber extends Component {

  state = {
    phoneNumber: '+1 ',
    keyboardShowFlg: false,
    spinnerVisible: false,
    spinnerText: 'loading...',
  }

  // because KeyboardAvoidingView does not do good job, we need to adjust margin size
  componentWillMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      this.setState({
        keyboardShowFlg: true,
      })
    });
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      this.setState({
        keyboardShowFlg: false,
      })
    });
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  // show spinner
  _showSpinner = ( { _spinnerText, _seconds } ) => {
    return Promise.resolve()
    .then(() => {
      // wait a sec
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, _seconds)
      })
    })
    .then(() => {
      this.setState({
        spinnerVisible: true,
        spinnerText: _spinnerText
      })
    })
    .then(() => {
      // wait a sec
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, _seconds)
      })
    })
  }

  // hide spinner
  _hideSpinner = ( { _seconds } ) => {
    return Promise.resolve()
    .then(() => {
      // wait a sec
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, _seconds)
      })
    })
    .then(() => {
      this.setState({
        spinnerVisible: false,
        spinnerText: 'loading...'
      })
    })
    .then(() => {
      // wait a sec
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, _seconds)
      })
    })
  }

  // submit phone number
  _submitPhoneNumber = () => {

    let { phoneNumber } = this.state;

    phoneNumber = phoneNumber.split(' ').join('');
    phoneNumber = phoneNumber.split('-').join('');

    const digits = phoneNumber.substr(1)
    const isnum = /^\d+$/.test(digits);
    if (isnum !== true || phoneNumber === '+1') {
      Alert.alert(
        'Error',
        'Phone number is invalid',
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )
      return;
    }

    let confirmResult

    Promise.resolve()
    .then(() => {
      const params = {
        _spinnerText: 'wait...',
        _seconds: 300,
      }
      return this._showSpinner(params)
    })
    .then(() => {
      // check
      if ( phoneNumber.substr(0, 1) != "+" ) {
        return Promise.reject(Error("country code not found"))
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      // request code send
      return firebase.auth().signInWithPhoneNumber(phoneNumber)
    })
    .then((results) => {
      confirmResult = results
      return this._hideSpinner({_seconds : 300})
    })
    .then(() => {
      // console.log("confirmResult: ", confirmResult)

      // code sent
      const params = {
        confirmResult: confirmResult,
        phoneNumber: phoneNumber,
      }
      this.props.updateConfirmResult(params)
    })
    .catch((err) => {
      console.log("err: ", err)

      return this._hideSpinner({_seconds : 300})

      Alert.alert(
        'Error',
        err.message,
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )
    });
  }

  // change phone number
  _handleChangeNumber = (phone) => {

    const preNumber = this.state.phoneNumber

    if (!phone) {
      phone = '+'
    }

    let backFlg = false
    if (preNumber.length > phone.length) {
      backFlg = true;
    }

    if (phone.length === 6 || phone.length === 10) {
      if (backFlg === false){
        phone = phone+" "
      }
    }

    this.setState({
      phoneNumber: phone
    })
  }

  render() {

    const {
      phoneNumber,
      keyboardShowFlg,
      spinnerVisible,
      spinnerText,
    } = this.state

    return (
      <View style={{
          flex:1,
        }}>

          <View style={{
              flex:1,
              justifyContent: 'flex-end'
            }}>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 0,
                padding: 0,
              }}>
                <Text style={{
                  marginTop: 0,
                  padding: 0,
                  fontFamily: 'AvenirNext-DemiBold',
                  }}>VERIFY PHONE NUMBER</Text>
            </View>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                padding: 16,
              }}>
                <TextInput
                  style={{
                    fontSize: 32,
                    width: '100%',
                    height: Platform.OS === 'ios' ? 45 : 60,
                  }}
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={phoneNumber}
                  keyboardTypde="numeric"
                  placeholder="+1"
                  onChangeText={this._handleChangeNumber} />
            </View>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                // marginBottom: 36,
              }}>
              <TouchableOpacity
                style={[Platform.OS === 'ios' ? styles.iosSubmitLoginBtn : styles.AndroidSubmitLoginBtn, {
                  marginBottom: keyboardShowFlg ? 32 : 25,
                }]}
                onPress={this._submitPhoneNumber}>
                  <Text style={styles.submitBtnText}>Next</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* spinner */}
          <Spinner
            visible={spinnerVisible}
            textContent={spinnerText}
            textStyle={{color: '#FFF'}} />

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
    marginBottom:0,
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
)(InputPhoneNumber)
