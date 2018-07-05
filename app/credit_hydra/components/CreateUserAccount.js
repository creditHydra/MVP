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
  Alert,
  Keyboard,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import * as WalletHelpers from '../utils/WalletHelpers'
import { setKeystore, setWeb3, setPassword } from '../actions/UserActions'
import * as StorageHelpers from '../utils/StorageHelpers'
import * as MyAPI from '../utils/MyAPI'
import Spinner from 'react-native-loading-spinner-overlay';

// create a new wallet
class CreateUserAccount extends Component {

  state = {
    password: '',
    spinnerVisible: false,
    spinnerText: 'loading...',
  }

  // create wallet
  _createWallet1 = () => {

    Promise.resolve()
    .then(() => {
      // close keyboard
      Keyboard.dismiss()
    })
    .then(() => {
      // if user select seed text, then >

      this._createWallet2()
    })
    .catch((err) => {
      console.log("err:" ,err)
    })
  }

  // show spinner
  _showSpinner = ( { _spinnerText } ) => {
    return Promise.resolve()
    .then(() => {
      // wait a sec
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 1000)
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
        }, 1000)
      })
    })
  }

  _createWallet2 = () => {

    const { password } = this.state
    const phoneNumber = this.props.profile.phoneNumber;

    this.props.setPassword({ account_password: password, })

    let newWallet
    let newWeb3

    Promise.resolve()
    .then(() => {
      return this._showSpinner({ _spinnerText: 'creating a wallet...' })
    })
    .then(() => {
      // generate new wallet
      // const params = {
      //   password: password
      // }
      // return createNewWallet(params)

      //
      // CRYPT THING IS VERY SLOW ON REACT NATIVE
      //

      console.log("-- 1 --")
      const params = {
        password: password
      }
      return MyAPI.createLightWallet(params)
    })
    .then((results) => {
      console.log("-- 2 --")
      if (!results) {
        return Promise.reject("server error");
      }
      if (results.status === 'status') {
        return Promise.reject(results.message);
      }

      const wallet_sel = results.wallet_sel;
      return StorageHelpers.deserializeWallet({ wallet_sel: wallet_sel })
    })

    .then((results) => {

      console.log("-- 2.1 --")

      // associate wallet with web3
      const params = {
        password: password,
        wallet: results,
      }
      return WalletHelpers.associateWalletWithWeb3(params)
    })


    .then(({ web3, wallet }) => {
      // wallet is generated

      console.log("-- 2.2 --")

      newWallet = wallet
      newWeb3 = web3

      // set passwordProvider to avoid future password request
      newWallet.passwordProvider = (callback) => {
        callback(null, password);
      };

    })


    .then(() => {

      console.log("-- 2.3 --")

      return this._showSpinner({ _spinnerText: 'sending transaction...' })
    })
    .then(() => {
      // generate raw transaction
      console.log("-- 2.4 --")

      const addresses = newWallet.getAddresses()
      const address = addresses[0]

      const params = {
        wallet: newWallet,
        web3: newWeb3,
        address: address,
        password: password,
        phoneNumber: phoneNumber,
      }
      return WalletHelpers.generateAddNewUserTX(params)
    })
    .then((results) => {
      console.log("-- 2.5 --")
      // signature is created.
      // send signature to oracle

      // const signedHash = results
      const signedTX = results
      // const phoneNumber = this.props.profile.phoneNumber;
      const addresses = newWallet.getAddresses()
      const address = addresses[0]

      console.log("-- 3 --")
      const params = {
        // signedHash: signedHash,
        signedTX: signedTX,
        address: address,
        phoneNumber: phoneNumber,
      }
      return MyAPI.createAccount(params)
    })
    .then((results) => {
      console.log("-- 4 --")

      // account creation tx was sent
      if (!results) {
        return Promise.reject(Error("server errror"))
      }
      if (results.status === 'error') {
        return Promise.reject(Error(results.message))
      }
      return Promise.resolve();
    })
    .then(() => {
      // save keystore on local storage
      return StorageHelpers.saveWalletOnStorage(newWallet)
    })
    .then(() => {
      this.setState({
        spinnerVisible: false,
      })
    })
    .then(() => {
      // update props
      const params = {
        web3: newWeb3
      }
      this.props.setWeb3(params)
    })
    .then(() => {
      const params = {
        wallet: newWallet,
      }
      this.props.setKeystore(params)
    })
    .catch((err) => {
      console.log("err: ", err)

      this.props.setPassword({ account_password: null, })

      Alert.alert(
        'Error',
        err.message,
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )

      this.setState({
        spinnerVisible: false,
      })

    })
  }

  // change phone number
  _handleChangeNumber = (pass) => {
    this.setState({
      password: pass
    })
  }

  render() {

    const {
      phoneNumber,
      spinnerVisible,
      spinnerText,
      password,
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
              }}>Set your password</Text>
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
                  height: Platform.OS === 'ios' ? 60 : 80,
                }}
                autoCapitalize='none'
                autoCorrect={false}
                value={password}
                keyboardTypde="numeric"
                placeholder="your password..."
                onChangeText={this._handleChangeNumber} />
          </View>

          <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={Platform.OS === 'ios' ? styles.iosSubmitLoginBtn : styles.AndroidSubmitLoginBtn}
              onPress={this._createWallet1}>
                <Text style={styles.submitBtnText}>Create an account</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* spinner */}
        <Spinner
          visible={spinnerVisible}
          textContent={spinnerText}
          textStyle={{color: '#ffffff'}} />

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

function mapStateToProps ({ user }) {

  if (user){

    let address
    if (user.wallet) {
      const addresses = user.wallet.getAddresses()
      address = addresses[0]
    }

    return {
      wallet: user.wallet,
      web3: user.web3,
      account_password: user.account_password,
      profile: user.profile,
      address: address,
    }
  } else {
    return {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setKeystore: (data) => dispatch(setKeystore({ params: data})),
    setWeb3: (data) => dispatch(setWeb3({ params: data})),
    setPassword: (data) => dispatch(setPassword({ params: data})),
  }
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(CreateUserAccount)
