import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Linking,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import { setProfile } from '../actions/UserActions'
import firebase from 'react-native-firebase';
import InputPhoneNumber from './InputPhoneNumber'
import InputVerificationCode from './InputVerificationCode'
import CreateUserAccount from './CreateUserAccount'
import { getProfileFromStorage, saveProfileOnStorage } from '../utils/StorageHelpers'
import { generatePublicPrivateKeys } from '../utils/WalletHelpers'
import Icon from 'react-native-fa-icons';

// veryfy phone numbre screen root
class VerifyPhoneNumber extends Component {

  state = {
    phoneNumber: '',
    confirmResult: null,
    phoneConfirmed: false,
    stepCount: 1,
    keyboardShowFlg: false,
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
  // receive something from Firebase
  _confirmResult = ({confirmResult, phoneNumber}) => {
     this.setState({
       confirmResult: confirmResult,
       phoneNumber: phoneNumber,
       stepCount: 2,
     })
  }

  _gotoFAQ = () => {
    const url = "https://credithydra.com/blog/faqs/"
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  }

  // phone number is confirmed
  _phoneNumberConfirmed = () => {

    const { phoneNumber } = this.state

    let userProfile

    Promise.resolve()
    .then(() => {
      // get profile
      return getProfileFromStorage()
    })
    .then((results) => {
      // save it
      userProfile = {};
      if (results) {
        userProfile = results
      }

      userProfile.phoneNumber = phoneNumber;

      // save it
      return saveProfileOnStorage(userProfile)
    })
    .then(() => {
      // update props
      const params = {
        profile: userProfile,
      }
      this.props.setProfile(params)
    })
    .then(() => {
      // update state
      this.setState({
        phoneConfirmed: true,
        stepCount: 3,
      })
    })
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  _backToPhoneNumberInput = () => {
    this.setState({
      stepCount: 1,
    })
  }

  // _gotoFAQ = () => {
  //
  //   const { navigation } = this.props
  //   navigation.navigate(
  //     'FaqView',
  //   )
  // }

  render() {

    const {
      phoneNumber,
      confirmResult,
      phoneConfirmed,
      stepCount,
      keyboardShowFlg,
    } = this.state

    return (
      <View style={styles.container}>

        {Platform.OS === 'ios' ? (

          <KeyboardAvoidingView behavior='padding' style={{
              flex: 1,
            }}>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 2,
              }}>
              <TouchableOpacity style={{
                flexDirection: 'row',
              }} onPress={this._gotoFAQ}>
                <Icon name='info' style={{
                    fontSize: 36,
                    color: '#999999',
                    marginTop: 2,
                    marginRight: 10,
                  }} />
              </TouchableOpacity>
            </View>

            {stepCount === 2 && (
              <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 2,
                }}>
                <TouchableOpacity style={{
                  flexDirection: 'row',
                }} onPress={this._backToPhoneNumberInput}>
                  <Icon name='angle-left' style={{
                      fontSize: 40,
                      color: hydraPink,
                      marginTop: 2,
                    }} />
                  <Text style={{
                      color: hydraPink,
                      fontSize: 20,
                      marginTop:10,
                      marginLeft: 6,
                    }}>Back</Text>
                </TouchableOpacity>
              </View>
            ) }

            {keyboardShowFlg === false && (
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
                      width: stepCount === 1 ? 100 : 70,
                      height: stepCount === 1 ? 100 : 70,
                    }}
                    source={require('../images/hydra_logo_image_560.png')} />
                </View>

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 6,
                  }}>
                    <Text style={{
                        fontFamily: 'AvenirNext-DemiBold',
                      }}>Please verify your identity to get started.</Text>
                </View>

              </View>
            )}


            {stepCount === 3 && (
              <CreateUserAccount/>
            )}

            {stepCount === 1 && (
              <InputPhoneNumber updateConfirmResult={this._confirmResult} />
            )}

            {stepCount === 2 && confirmResult && (
              <InputVerificationCode
                confirmResult={confirmResult}
                phoneNumberConfirmed={this._phoneNumberConfirmed}/>
            )}
          </KeyboardAvoidingView>

        ) : (





          <View style={{
              flex: 1,
            }}>


            <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 2,
              }}>
              <TouchableOpacity style={{
                flexDirection: 'row',
              }} onPress={this._gotoFAQ}>
                <Icon name='info' style={{
                    fontSize: 36,
                    color: '#999999',
                    marginTop: 2,
                    marginRight: 10,
                  }} />
              </TouchableOpacity>
            </View>

            {stepCount === 2 && (
              <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 2,
                }}>
                <TouchableOpacity style={{
                  flexDirection: 'row',
                }} onPress={this._backToPhoneNumberInput}>
                  <Icon name='angle-left' style={{
                      fontSize: 40,
                      color: hydraPink,
                      marginTop: 2,
                    }} />
                  <Text style={{
                      color: hydraPink,
                      fontSize: 20,
                      marginTop:10,
                      marginLeft: 6,
                    }}>Back</Text>
                </TouchableOpacity>
              </View>
            ) }

            {keyboardShowFlg === false && (
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
                      width: stepCount === 1 ? 100 : 70,
                      height: stepCount === 1 ? 100 : 70,
                    }}
                    source={require('../images/hydra_logo_image_560.png')} />
                </View>

                {/*<View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 6,
                  }}>
                    <Text style={{
                        fontFamily: 'AvenirNext-DemiBold',
                      }}>Create an account</Text>
                </View>*/}

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 6,
                  }}>
                    <Text style={{
                        fontFamily: 'AvenirNext-DemiBold',
                      }}>Please verify your identity to get started, Curently during promotion you will get additional 13 tokens for identity verification. We will also charge 3 tokens for the verification.</Text>
                </View>

              </View>
            )}

            {stepCount === 3 && (
              <CreateUserAccount/>
            )}

            {stepCount === 1 && (
              <InputPhoneNumber updateConfirmResult={this._confirmResult} />
            )}

            {stepCount === 2 && confirmResult && (
              <InputVerificationCode
                confirmResult={confirmResult}
                phoneNumberConfirmed={this._phoneNumberConfirmed}/>
            )}
          </View>
        )}




      </View>
    )
  }
}

// KeyboardAvoidingView

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

function mapDispatchToProps (dispatch) {
  return {
    setProfile: (data) => dispatch(setProfile({ params: data})),
  }
}

export default connect(
  null, mapDispatchToProps
)(VerifyPhoneNumber)
