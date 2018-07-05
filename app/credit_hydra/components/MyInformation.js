import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import Icon from 'react-native-fa-icons';
import PasswordModal from './PasswordModal'
import { setPassword } from '../actions/UserActions'
import * as WalletHelpers from '../utils/WalletHelpers'
import Spinner from 'react-native-loading-spinner-overlay';
import * as StorageHelpers from '../utils/StorageHelpers'

// screen for my information like phone number and address
class MyInformation extends Component {

  state = {
    isModalVisible: false,
    seedText: null,
    spinnerVisible: false,
    spinnerText: 'loading...',
    publicKey: null
  }

  componentDidMount () {

    // get only public key
    StorageHelpers.getCrypto2PublickeyFromStorage()
    .then((results) => {
      if (results) {
        this.setState({
          publicKey: results.publicKey
        })
      }
    })
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  // go to edit profile screen
  _gotoEditProfile = () => {
    const { navigation } = this.props
    navigation.navigate(
      'EditProfile',
    )
  }

  // start showing seed text to recover wallet address
  _showSeed = () => {

    const { seedText } = this.state
    if (seedText) {
      this.setState({
        seedText: null,
      })
      return;
    }

    const { account_password } = this.props
    if (account_password) {
      this._showSeed2(account_password)
      return;
    }

    this.setState({
      isModalVisible: true,
    })
  }

  // show seed text
  _showSeed2 = (password) => {

    const { wallet } = this.props

    const params = {
      wallet: wallet,
      password: password,
    }
    WalletHelpers.showSeed(params)
    .then((results) => {

      this.setState({
        seedText: results
      })
    }).
    catch((err) => {
      console.log("err: ", err);

      this._showError({err: err})
    })
  }

  // show error
  _showError = ( { err } ) => {
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
      this.props.setPassword({password: null})
    })
    .then(() => {
      // wait a sec
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 500)
      })
    })
    .then(() => {
      Alert.alert(
        'Error',
        err.message,
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )
    })
  }

  // password input
  _passwordInput = (password) => {

    Promise.resolve()
    .then(() => {
      this.setState({ isModalVisible: false });
    })
    .then(() => {
      // wait a sec
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 500)
      })
    })
    .then(() => {
      this._showSeed2(password)
    })
    .catch((err) => {
      console.log("err:",err)
    })
  }

  // close modal
  _closeModal = () => {
    this.setState({
      isModalVisible: false,
    })
  }

  // generate public and private keys for file encryption
  _generateKeys = () => {

    let publicKey
    const { account_password } = this.props

    Promise.resolve()
    .then(() => {
      return StorageHelpers.getCrypto2PublickeyFromStorage()
    })
    .then((results) => {

      if (results){
        Alert.alert(
          'Error',
          'You alrady have keys',
          [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          { cancelable: true }
        )
        return Promise.reject(Error("you already have keys"))
      }

      this.setState({
        spinnerVisible: true,
        spinnerText: 'Generating Keys...'
      })

      // genarate public and private key
      return WalletHelpers.generatePublicPrivateKeys()
    })
    .then((results) => {
      // saveCrypto2KeysOnStorage

      publicKey = results.publicKey

      const params = {
        privateKey: results.privateKey,
        publicKey: results.publicKey,
        password: account_password,
      }
      return StorageHelpers.saveCrypto2KeysOnStorage(params)
    })
    .then(() => {
      this.setState({
        publicKey: publicKey,
        spinnerVisible: false,
      })
    })
    .catch((err) => {
      console.log("err: ", err)
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
    })
  }

  _copyAddress = () => {

    const { address } = this.props
    Clipboard.setString(address);

    Alert.alert(
      'Copied',
      address,
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      { cancelable: true }
    )
  }

  _copySeedText = () => {
    const { seedText } = this.state
    Clipboard.setString(seedText);
    Alert.alert(
      'Copied',
      seedText,
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      { cancelable: true }
    )
  }

  render() {

    const { profile, address, userStatus } = this.props
    const {
      isModalVisible,
      seedText,
      spinnerVisible,
      spinnerText,
      publicKey,
    } = this.state


    let certificate_text = ""
    if ( userStatus === 1 ) {
      certificate_text = "Account created"
    } else if ( userStatus === 2 ) {
      certificate_text = "Verification requested"
    } else if ( userStatus === 3 ) {
      certificate_text = "Verified"
    } else if ( userStatus === 4 ) {
      certificate_text = "Rejected"
    } else {
      certificate_text = "Account created"
    }
    console.log("userStatus: ", userStatus)

    let showEditButton = true;
    if ( userStatus === 1 || userStatus === 4 ) {
      showEditButton = true;
    } else {
      showEditButton = false;
    }


    return (
      <View style={styles.container}>
      <ScrollView style={{
          flex: 1,
          marginBottom: 10,
        }}>

        <View style={{
            flex:1,
            justifyContent: 'flex-start'
          }}>

          {showEditButton === true && (
            <TouchableOpacity style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }} onPress={this._gotoEditProfile}>
              <Icon name='pencil-square-o' style={{
                  fontSize: 20,
                  color: 'green',
                  justifyContent: 'flex-end',
                  marginTop: 2,
                }} />
            </TouchableOpacity>
          )}

          <View style={{
              // flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 0,
            }}>
            <Image style={{
              width: 140,
              height: 140,
              // backgroundColor: '#cccccc',
              borderRadius: 70,
              borderWidth: 6,
              borderColor: '#ffffff',
            }} source={{uri: `data:image/png;base64,${profile.imageBase64}`}} />
          </View>

          <View style={{
              // flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 10,
            }}>
              <Text>{profile.name}</Text>
          </View>



          {/* Certificate */}
          <View style={{
            marginTop: 10,
            borderBottomColor: '#cccccc',
            borderBottomWidth: 1,
            borderStyle: 'solid',
            paddingTop: 10,
            paddingBottom: 10,
          }}>
            <View style={{
                // flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                // marginTop: 10,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: hydraPink,
                }}>Status</Text>
            </View>

            <View style={{
                // flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginTop: 8,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#777777',
                }}>{certificate_text}</Text>
            </View>
          </View>

          {/* Phone */}
          <View style={{
            marginTop: 10,
            borderBottomColor: '#cccccc',
            borderBottomWidth: 1,
            borderStyle: 'solid',
            paddingTop: 10,
            paddingBottom: 10,
          }}>
            <View style={{
                // flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                // marginTop: 10,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: hydraPink,
                }}>Phone</Text>
            </View>

            <View style={{
                // flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginTop: 8,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#777777',
                }}>{profile.phoneNumber}</Text>
            </View>
          </View>

          {/* Address */}
          <View style={{
            marginTop: 10,
            borderBottomColor: '#cccccc',
            borderBottomWidth: 1,
            borderStyle: 'solid',
            paddingTop: 10,
            paddingBottom: 10,
          }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
                <Text style={{
                  fontSize: 12,
                  color: hydraPink,
                }}>Address</Text>

                <TouchableOpacity onPress={this._copyAddress}>
                  <Icon name='copy' style={{
                      fontSize: 20,
                      color: '#777777',
                      marginTop: 2,
                    }} />
                </TouchableOpacity>

            </View>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginTop: 8,
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#777777',
                }}>{address}</Text>
            </View>
          </View>

          {/* Show seed */}
          <View style={{
            marginTop: 10,
            borderBottomColor: '#cccccc',
            borderBottomWidth: 1,
            borderStyle: 'solid',
            paddingTop: 10,
            paddingBottom: 10,
          }}>
            <TouchableOpacity onPress={this._showSeed}>
              <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: hydraPink,
                  }}>Seed text</Text>

                {seedText && (
                  <TouchableOpacity onPress={this._copySeedText}>
                    <Icon name='copy' style={{
                        fontSize: 20,
                        color: '#777777',
                        marginTop: 2,
                      }} />
                  </TouchableOpacity>
                )}

              </View>

              <View style={{
                  // flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 8,
                }}>

                <Icon name='shield' style={{
                    fontSize: 20,
                    color: seedText ? '#cccccc' : 'green',
                    justifyContent: 'flex-end',
                    marginTop: 2,
                  }} />

                <Text style={{
                  fontSize: 12,
                  color: '#777777',
                  marginLeft: 10,
                  marginTop: 4,
                }}>Show seed text</Text>
              </View>
            </TouchableOpacity>

            {seedText && (
              <Text style={{
                fontSize: 12,
                color: '#777777',
                }}>{seedText}</Text>
            )}

          </View>


          {/* public and private keys */}
          {!publicKey && (
            <View style={{
              marginTop: 10,
              borderBottomColor: '#cccccc',
              borderBottomWidth: 1,
              borderStyle: 'solid',
              paddingTop: 10,
              paddingBottom: 10,
            }}>
              <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: hydraPink,
                  }}>Your keys for file encryption</Text>
              </View>


              <TouchableOpacity onPress={this._generateKeys} style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 8,
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: '#777777',
                  }}>Generate keys</Text>
              </TouchableOpacity>

            </View>
          )}

        </View>

        <PasswordModal
          isModalVisible={isModalVisible}
          callbackWithFail={this._closeModal}
          callbackWithSuccess={this._passwordInput} />


        {/* spinner */}
        <Spinner
          visible={spinnerVisible}
          textContent={spinnerText}
          textStyle={{color: '#ffffff'}} />

      </ScrollView>
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
      userStatus: user.userStatus,
    }
  } else {
    return {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setPassword: (data) => dispatch(setPassword({ params: data})),
  }
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(MyInformation)
