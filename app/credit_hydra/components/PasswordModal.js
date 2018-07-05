import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import Icon from 'react-native-fa-icons';
import Modal from "react-native-modal";
import { setPassword } from '../actions/UserActions'

class PasswordModal extends Component {

  state = {
    password: null,
  }

  _handleChangePassword = (pass) => {
    this.setState({
      password: pass,
    })
  }

  _submitPassword = () => {
    const { password } = this.state

    this.props.setPassword({account_password: password})

    this.props.callbackWithSuccess(password)
  }

  _closeModal = () => {
    this.props.callbackWithFail()
  }

  render() {
    const { password } = this.state
    const { isModalVisible } = this.props

    return (

      <Modal isVisible={isModalVisible}>

        {Platform.OS === 'ios' ? (

          <KeyboardAvoidingView behavior='padding' style={{
              flex: 1,
              alignItems:'center',
              justifyContent: 'center',
            }}>

            <View style={{
                justifyContent: 'space-around',
                width: '90%',
                height: '50%',
                backgroundColor: '#ffffff',
                padding: 20,
              }}>

              <View style={{
                  flex:1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>

                <TouchableOpacity onPress={this._closeModal}>
                  <Icon name='times' style={{
                      fontSize: 20,
                      color: '#777777',
                      justifyContent: 'flex-end',
                      marginTop: 2,
                    }} />
                </TouchableOpacity>

              </View>

              <Text style={{
                  fontSize: 16,
                  marginTop: 16,
                }}>Input your password</Text>

              <View style={
                  Platform.OS === 'ios' ? {
                    borderStyle: 'solid',
                    borderBottomColor: '#cccccc',
                    borderBottomWidth: 1,
                    marginTop: 16,
                  } : {
                    marginTop: 16,
                  }
                }>
                <TextInput
                  style={{
                    fontSize: 16,
                    width: '100%',
                    height: 45,
                  }}
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={password}
                  keyboardTypde="numeric"
                  placeholder="your password"
                  onChangeText={this._handleChangePassword} />
              </View>


              <TouchableOpacity onPress={this._submitPassword} style={{
                  marginTop: 48,
                  width: '100%',
                  backgroundColor: hydraPink,
                  justifyContent: 'center',
                  alignItems:'center',
                  padding: 8,
                  borderRadius: 6,
                }}>
                <Text style={{
                    fontSize: 16,
                    color: '#ffffff',
                  }}>Submit</Text>
              </TouchableOpacity>

            </View>

          </KeyboardAvoidingView>

        ) : (

          <View style={{
              flex: 1,
              alignItems:'center',
              justifyContent: 'center',
            }}>

            <View style={{
                justifyContent: 'space-around',
                width: '90%',
                height: '50%',
                // height: 200,
                backgroundColor: '#ffffff',
                padding: 20,
              }}>

              <View style={{
                  flex:1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>

                <TouchableOpacity onPress={this._closeModal}>
                  <Icon name='times' style={{
                      fontSize: 20,
                      color: '#777777',
                      justifyContent: 'flex-end',
                      marginTop: 2,
                    }} />
                </TouchableOpacity>

              </View>

              <Text style={{
                  fontSize: 16,
                  marginTop: 16,
                }}>Input your password</Text>

              <View style={
                  Platform.OS === 'ios' ? {
                    borderStyle: 'solid',
                    borderBottomColor: '#cccccc',
                    borderBottomWidth: 1,
                    marginTop: 16,
                  } : {
                    marginTop: 16,
                  }
                }>
                <TextInput
                  style={{
                    fontSize: 16,
                    width: '100%',
                    height: 45,
                  }}
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={password}
                  keyboardTypde="numeric"
                  placeholder="your password"
                  onChangeText={this._handleChangePassword} />
              </View>


              <TouchableOpacity onPress={this._submitPassword} style={{
                  marginTop: 48,
                  width: '100%',
                  backgroundColor: hydraPink,
                  justifyContent: 'center',
                  alignItems:'center',
                  padding: 8,
                  borderRadius: 6,
                }}>
                <Text style={{
                    fontSize: 16,
                    color: '#ffffff',
                  }}>Submit</Text>
              </TouchableOpacity>

            </View>

          </View>

        )}


      </Modal>
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
    setPassword: (data) => dispatch(setPassword({ params: data})),
  }
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(PasswordModal)
