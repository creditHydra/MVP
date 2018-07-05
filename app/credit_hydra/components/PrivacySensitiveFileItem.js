import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Image,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import Icon from 'react-native-fa-icons';
import * as MyAPI from '../utils/MyAPI'
import {
  makeSignatureOnMessage,
  getAllIPFSData,
  checkTokenBalance,
  generateFileUploadedTX,
  generateAddValidationRequestTX,
} from '../utils/WalletHelpers'
import PasswordModal from './PasswordModal'
import UploadedItem from './UploadedItem'
import DocumentModal from './DocumentModal'
import Spinner from 'react-native-loading-spinner-overlay';
import * as ImageHelpers from '../utils/ImageHelpers'
import * as StorageHelpers from '../utils/StorageHelpers'

// screen for uploading an image file
class PrivacySensitiveFileItem extends Component {

  state = {
    imageBase64: null,
    uploadFileOneByOneFlg: false,
  }

  _startCameraOrLibrary = () => {

    const params = {
      _width: 800,
      _height: 600,
      _ios: Platform.OS === 'ios' ? true : false,
    }
    ImageHelpers.uploadFileStart(params)
    .then((results) => {
      
      const imageBase64 = results
      
      this.setState({
        imageBase64: imageBase64
      })
      
      return Promise.resolve(imageBase64)
    })
    .then((results) => {
      const imageBase64 = results
      this._uploadFile1({imageBase64: imageBase64})
    })
    .catch((err) => {
      console.log("err: ",err)
    })
  }

  _uploadFile1 = ({ imageBase64 }) => {
    // const { imageBase64 } = this.state
    const { fileType } = this.props

    const params = {
      _imageBase64: imageBase64,
      _fileType: fileType,
    }
    this.props.uploadFile1(params)
  }


  render() {

    const { imageBase64, uploadFileOneByOneFlg } = this.state
    const { typeName, fileType, item, privacyFileFlg } = this.props

    let cameraColor = hydraPink
    if (imageBase64) {
      cameraColor = '#cccccc'
    }
    let uploadColor = hydraPink;
    if ( privacyFileFlg === true ) {
      uploadColor = '#cccccc';
    }

    return (

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
            }}>{typeName}</Text>

            <TouchableOpacity onPress={this._startCameraOrLibrary} style={{
                backgroundColor: cameraColor,
                paddingTop: 6,
                paddingBottom: 6,
                paddingRight: 18,
                paddingLeft: 18,
                borderRadius: 6,
              }}>
                <Icon name='camera' style={{
                    fontSize: 20,
                    color: 'white',
                    justifyContent: 'flex-end',
                    marginTop: 2,
                  }} />
            </TouchableOpacity>

        </View>

        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>

          {imageBase64 && (
            <Image
              style={{
                width: 80,
                height: 60,
              }}
              source={{uri: `data:image/png;base64,${imageBase64}`}} />
          )}
          
        </View>

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
})

function mapStateToProps ({ user }) {

  if (user){
    return {
      wallet: user.wallet,
      web3: user.web3,
      account_password: user.account_password,
      profile: user.profile,
    }
  } else {
    return {}
  }
}


export default connect(
  mapStateToProps, null
)(PrivacySensitiveFileItem)
