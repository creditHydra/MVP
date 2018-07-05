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
import Icon from 'react-native-fa-icons';
import Spinner from 'react-native-loading-spinner-overlay';

// screen for input verification code from Firebase
class InputVerificationCode extends Component {

  state = {
    verificationCode: '',
    confirmResult: null,
    spinnerVisible: false,
    spinnerText: 'loading...',
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        
        Promise.resolve()
        .then(() => {
          return this._hideSpinner({_seconds : 300})
        })
        .then(() => {
          this.props.phoneNumberConfirmed()
        })
        .catch((err) => {
          console.log("err: ", err)
        })
        
      } else {
        console.log("onAuthStateChanged: no user")
      }
    });
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

  // submit ver
  _submitVerificationCode = () => {

    const { confirmResult } = this.props;
    const {
      verificationCode,
    } = this.state;

    const isnum = /^\d+$/.test(verificationCode);
    if (isnum !== true){
      Alert.alert(
        'Error',
        'Verification code is invalid',
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )
      return;
    }

    Promise.resolve()
    .then(() => {
      Keyboard.dismiss()
    })
    .then(() => {
      const params = {
        _spinnerText: 'wait...',
        _seconds: 300,
      }
      return this._showSpinner(params)
    })
    .then(() => {
      return confirmResult.confirm(verificationCode)
    })
    .then((results) => {
      return this._hideSpinner({_seconds : 300})
    })
    // .then((user) => {
    //   // If you need to do anything with the user, do it here
    //   // The user will be logged in automatically by the
    //   // `onAuthStateChanged` listener we set up in App.js earlier
    // 
    //   console.log("unko")
    //   //this.props.phoneNumberConfirmed()
    // })
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

  // change verification code
  _handleChangeNumber = (code) => {
    this.setState({
      verificationCode: code
    })
  }

  render() {

    const {
      verificationCode,
      spinnerVisible,
      spinnerText,
    } = this.state

    return (
      <View style={styles.container}>

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
              }}>VERIFY CODE</Text>
          </View>

          <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              padding: 16,
            }}>
              <TextInput
                style={{
                  fontSize: 48,
                  width: '100%',
                  height: Platform.OS === 'ios' ? 60 : 80,
                }}
                autoCapitalize='none'
                autoCorrect={false}
                value={verificationCode}
                keyboardTypde="numeric"
                placeholder="1234"
                onChangeText={this._handleChangeNumber} />
          </View>

          <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={Platform.OS === 'ios' ? styles.iosSubmitLoginBtn : styles.AndroidSubmitLoginBtn}
              onPress={this._submitVerificationCode}>
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
)(InputVerificationCode)
