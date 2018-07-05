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

// screen for uploading an image file
class ProfilePhotoFileItem extends Component {

  state = {
    imageBase64: null,
    uploadFileOneByOneFlg: false,
  }

  _startCameraOrLibrary = () => {
    const params = {
      _width: 600,
      _height: 600,
      _ios: Platform.OS === 'ios' ? true : false,
    }
    ImageHelpers.uploadFileStart(params)
    .then((results) => {
      this.setState({
        imageBase64: results
      })
      
      return Promise.resolve(results)
    })
    .then((results) => {
      this.props.uploadFile1({ _imageBase64: results, _fileType: this.props.fileType })
    })
    .catch((err) => {
      console.log("err: ",err)
    })
  }

  _uploadFile1 = () => {
    const { imageBase64 } = this.state
    const { fileType } = this.props

    const params = {
      _imageBase64: imageBase64,
      _fileType: fileType,
    }
    this.props.uploadFile1(params)
  }

  render() {

    const { imageBase64, uploadFileOneByOneFlg } = this.state
    const { typeName, fileType, item, ipfsHash } = this.props

    let cameraColor = hydraPink
    if (ipfsHash || imageBase64) {
      cameraColor = '#cccccc'
    }
    let uploadColor = hydraPink;
    if ( item && item.justUploaded === true ) {
      uploadColor = '#cccccc';
    }
    if (ipfsHash) {
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

            {ipfsHash && (
              <Icon name='check' style={{
                  fontSize: 20,
                  color: 'green',
                  marginTop: -4,
                  marginLeft: 6,
                }} />
            )}
            
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
            // flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
            
            {/*<Text style={{
              fontSize: 12,
              color: '#777777',
              width: '80%',
            }}>
            {ipfsHash}
            </Text>*/}
            
            {imageBase64 && (
              <Image
                style={{
                  width: 60,
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
)(ProfilePhotoFileItem)
