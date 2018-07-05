import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import Icon from 'react-native-fa-icons';
import Modal from "react-native-modal";
import { setPassword } from '../actions/UserActions'

// modal for showing image
class DocumentModal extends Component {

  // close modal
  _closeModal = () => {
    this.props.callbackWithFail()
  }

  render() {

    const { isModalVisible, decryptData, profile } = this.props

    let trimmed
    if ( decryptData ){
      const decryptData_length = decryptData.length
      trimmed = decryptData.substring(1, decryptData_length - 2)
    }

    return (

      <Modal isVisible={isModalVisible} style={{
        alignItems:'center',
        justifyContent: 'center',
      }}>

        <View style={{
            alignItems:'center',
            justifyContent: 'center',
            width: '90%',
            height: '60%',
          }}>

          <View style={{
              justifyContent: 'flex-end',
              flexDirection: 'row',
              padding:8,
            }}>

            <TouchableOpacity onPress={this._closeModal} style={{
                flex:1,
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <Icon name='times' style={{
                  fontSize: 20,
                  color: '#ffffff',
                  marginTop: 2,
                }} />
            </TouchableOpacity>

          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: '#ffffff',
            borderWidth: 1,
            borderStyle: 'solid',
          }}>

            {decryptData && (
              <Image style={{
                width: 300,
                height: 400,
                alignSelf: 'center',
              }} source={{uri: `data:image/png;base64,${trimmed}`}} />
            )}

          </View>

        </View>
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
)(DocumentModal)
