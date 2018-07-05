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
import * as StorageHelpers from '../utils/StorageHelpers'
import { setProfile } from '../actions/UserActions'
import Spinner from 'react-native-loading-spinner-overlay';
import * as WalletHelpers from '../utils/WalletHelpers'
import * as ImageHelpers from '../utils/ImageHelpers'
import * as MyAPI from '../utils/MyAPI'
import PasswordModal from './PasswordModal'

// create a new profile screen
class CreateProfile extends Component {

  state = {
    // imageBase64: null,
    userName: '',
    spinnerVisible: false,
    spinnerText: 'loading...',
    isModalVisible: false,
    keyboardShowFlg: false,
  }
  
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

  // _startCameraOrLibrary = () => {
  // 
  //   const params = {
  //     _width: 600,
  //     _height: 600,
  //     _ios: Platform.OS === 'ios' ? true : false,
  //   }
  //   ImageHelpers.uploadFileStart(params)
  //   .then((results) => {
  //     // this.setState({
  //     //   imageBase64: results
  //     // })
  //   })
  //   .catch((err) => {
  //     console.log("err: ",err)
  //   })
  // }

  // change phone number
  _handleChangeName = (name) => {
    this.setState({
      userName: name
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
        }, 500)
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
        }, 500)
      })
    })
  }

  // https://github.com/Snapp-FidMe/react-native-image-base64
  // start saving profile
  _saveProfile2 = ({password}) => {

    // close keyboard
    Keyboard.dismiss()

    // const { imageBase64, userName } = this.state
    const { userName } = this.state
    

    const { wallet, web3 } = this.props
    const addresses = wallet.getAddresses()
    const address = addresses[0]

    // fileType 1: profile photo front
    const fileType = 1

    // if (!imageBase64 || !userName) {
    if (!userName) {
      Alert.alert(
        'Error',
        "Please input your legal name",
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )
      return;
    }

    let ipfsHash

    Promise.resolve()
    .then(() => {
      return this._showSpinner({ _spinnerText: 'generating keys ...' })
    })
    // .then((results) => {
    //   // save image
    //   return this._saveProfileImageOnStrage(imageBase64)
    // })
    .then((results) => {
      // start generating keys
      
      // genarate public and private key
      // return WalletHelpers.generatePublicPrivateKeys()
      return MyAPI.generateKeypair({})
    })
    .then((results) => {
      if (!results) {
        return Promise.reject("server error");
      }
      if (results.status === 'error') {
        return Promise.reject(results.message);
      }
    
      const privateKey = results.privateKey2.split("___").join("\n")
      const publicKey = results.publicKey2.split("___").join("\n")
    
      const params = {
        privateKey: privateKey,
        publicKey: publicKey,
        password: password,
      }
      return StorageHelpers.saveCrypto2KeysOnStorage(params)
    })
    
    .then(() => {
      return this._showSpinner({_spinnerText: 'processing data...'})
    })
    // .then(() => {
    //   // uploda encrypted data
    //   const params = {
    //     imageBase64: imageBase64,
    //     fileType: fileType,
    //     wallet: wallet,
    //     web3: web3,
    //     account_password: password,
    //   }
    //   return ImageHelpers.uploadNormalFile(params)
    // })
    // .then((results) => {
    //   ipfsHash = results.ipfsHash
    // })
    // .then(() => {
    //   return this._showSpinner({_spinnerText: 'sending transaction...'})
    // })
    // .then(() => {
    //   // uploda encrypted data
    //   const params = {
    //     fileType: fileType,
    //     wallet: wallet,
    //     web3: web3,
    //     account_password: password,
    //     ipfsHash: ipfsHash,
    //   }
    //   return ImageHelpers.sendNormalFileTX(params)
    // })
    // .then((results) => {
    //   const docIdx = results.docIdx;
    // })
    .then(() => {
      // close spinner
      return this.setState({
        spinnerVisible: false,
      })
    })
    .then(() => {
      // save name
      return this._saveProfileNameOnStrage()
    })
    .catch((err) => {

      this.setState({
        spinnerVisible: false,
      })

      Alert.alert(
        'Error',
        err.message,
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )
      console.log("err:", err)
    })
  }

  // save image on storage
  _saveProfileImageOnStrage = (base64) => {

    let userProfile

    return Promise.resolve()
    .then(() => {
      // get profile
      return StorageHelpers.getProfileFromStorage()
    })
    .then((results) => {

      if (!results){
        return Promise.reject(Error("no profile found"))
      }

      userProfile = results;
      userProfile.imageBase64 = base64;

      // save it
      return StorageHelpers.saveProfileOnStorage(userProfile)
    })
    .then(() => {
      const params = {
        profile: userProfile,
      }
      this.props.setProfile(params)
    })
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  // save profile on storage
  _saveProfileNameOnStrage = () => {

    const { userName } = this.state

    let userProfile

    return Promise.resolve()
    .then(() => {
      // get profile
      return StorageHelpers.getProfileFromStorage()
    })
    .then((results) => {

      if (!results){
        return Promise.reject(Error("no profile found"))
      }

      userProfile = results;
      userProfile.name = userName;

      // save it
      return StorageHelpers.saveProfileOnStorage(userProfile)
    })
    .then(() => {
      const params = {
        profile: userProfile,
      }
      this.props.setProfile(params)
    })
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  // close modal
  _closeModal = () => {
    this.setState({
      isModalVisible: false,
    })
  }

  // modal is close with password
  _closeModalWithPassword = (password) => {
    
    Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        this.setState({
          isModalVisible: false,
        }, () => {
          resolve()
        })
      })
    })
    .then(() => {
      this._saveProfile2({password: password});
    })
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  _saveProfile1 = () => {

    const { account_password } = this.props
    if ( account_password ) {
      this._saveProfile2({password: account_password})
    } else {
      this.setState({
        isModalVisible: true,
      })
    }
  }

  render() {

    const {
      imageBase64,
      userName,
      spinnerVisible,
      spinnerText,
      isModalVisible,
      keyboardShowFlg,
    } = this.state

    return (
      <KeyboardAvoidingView behavior='padding' style={styles.container}>

        <View style={{
            flex:1,
            justifyContent: 'flex-start'
          }}>

          
          { keyboardShowFlg === true ? (
            <View style={{
                flex:1,
                justifyContent: 'flex-start'
              }} />
          ) : (
            <View style={{
                flex:1,
                justifyContent: 'flex-start'
              }}>

              <View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 30,
                }}>
                <Image
                  style={{
                    width: 70,
                    height: 70,
                  }}
                  source={require('../images/hydra_logo_image_560.png')} />
              </View>

              <View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 16,
                }}>
                  <Text style={{
                      fontFamily: 'AvenirNext-DemiBold',
                    }}>Please verify your identity to get started, Curently during promotion you will get additional 13 tokens for identity verification. We will also charge 3 tokens for the verification.</Text>
              </View>

            </View>
          ) }
          

          {/*<TouchableOpacity onPress={this._startCameraOrLibrary} style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 30,
            }}>

            {imageBase64 ? (
              <Image style={{
                width: 140,
                height: 140,
                borderRadius: 70,
              }} source={{uri: `data:image/png;base64,${imageBase64}`}} />
            ) : (
              <Image style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                // backgroundColor: '#cccccc',
              }} source={require('../images/default_profile.jpg')} />
            )}

          </TouchableOpacity>*/}

          <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              marginTop: 20,
            }}>
              <Text style={{
                  fontFamily: 'AvenirNext-DemiBold',
                  fontSize: 20,
                }}>Name</Text>
          </View>
          
          <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 0,
            }}>
            <TextInput
              style={{
                fontFamily: 'AvenirNext-DemiBold',
                fontSize: 36,
                width: '100%',
                backgroundColor: Platform.OS === 'ios' ? '#dedede' : '#ffffff',
                height: 60,
              }}
              autoCapitalize='none'
              autoCorrect={false}
              value={userName}
              placeholder="Your name..."
              onChangeText={this._handleChangeName} />
          </View>


          <View style={{
              // flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 20,
            }}>
            <TouchableOpacity
              style={Platform.OS === 'ios' ? styles.iosSubmitLoginBtn : styles.AndroidSubmitLoginBtn}
              onPress={this._saveProfile1}>
                <Text style={styles.submitBtnText}>
                  Create a profile
                </Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* spinner */}
        <Spinner
          visible={spinnerVisible}
          textContent={spinnerText}
          textStyle={{color: '#ffffff'}} />

        {/* password modal */}
        <PasswordModal
          isModalVisible={isModalVisible}
          callbackWithFail={this._closeModal}
          callbackWithSuccess={this._closeModalWithPassword} />

      </KeyboardAvoidingView>
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
    marginBottom:25,
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: 'center',
  },
})

function mapStateToProps ({ user }) {

  if (user) {
    return {
      wallet: user.wallet,
      web3: user.web3,
      account_password: user.account_password,
      profile: user.profile,
      hnt_balance: user.hnt_balance,
      userStatus: user.userStatus,
    }
  } else {
    return {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setProfile: (data) => dispatch(setProfile({ params: data})),
  }
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(CreateProfile)
