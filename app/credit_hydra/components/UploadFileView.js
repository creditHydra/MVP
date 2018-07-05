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
  AppState,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import * as StorageHelpers from '../utils/StorageHelpers'
import Icon from 'react-native-fa-icons';
import * as MyAPI from '../utils/MyAPI'
import * as WalletHelpers from '../utils/WalletHelpers'
import PasswordModal from './PasswordModal'
import UploadedItem from './UploadedItem'
import DocumentModal from './DocumentModal'
import Spinner from 'react-native-loading-spinner-overlay';
import ProfilePhotoFileItem from './ProfilePhotoFileItem'
import * as UserActions from '../actions/UserActions'
import * as ImageHelpers from '../utils/ImageHelpers'
import PrivacySensitiveFileItem from './PrivacySensitiveFileItem'

// screen for uploading an image file
class UploadFileView extends Component {

  state = {

    imageBase64: null,
    isModalVisible: false,
    uploadedItemArray: [],
    isDocumentModalVisible: false,
    decryptData: null,
    nextStep: null,
    // handlingItem: null,
    spinnerVisible: false,
    spinnerText: 'loading...',
    fileType: null,

    profileRightItem: null,
    profileLeftItem: null,
    profileLicenseItem: null,
    profileRightHash: null,
    profileLeftHash: null,
    // profileLicenseHash: null,
    privacyFileFlg: false,
    encryptedPrivacyFile: null,
    appState: AppState.currentState,


    profileFrontBase64: null,
    profileRightBase64: null,
    profileLeftBase64: null,
    // profileBase64: null,
  }

  // fetch already uploaded files
  componentDidMount () {

    // get hashes from blockchain
    // this._fetchYourDocuments2()

    // check if privacy sensitive file is ready
    StorageHelpers.getDLorPassportOnStorage()
    .then((results) => {
      if (results) {
        this.setState({
          privacyFileFlg: true,
          encryptedPrivacyFile: results
        })
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }

  // get your document from ipfs
  _fetchYourDocuments2 = () => {

    const { wallet, web3 } = this.props
    const addresses = wallet.getAddresses()
    const address = addresses[0]

    Promise.resolve()
    .then(() => {
      // get ipfs
      const params = {
        address: address,
        fileType: 2,
        web3: web3,
      }
      return WalletHelpers.getIPFSDataWithType(params)
    })
    .then((results) => {

      let ipfsHash = null
      if (results){
        ipfsHash = results.ipfsHash
      }

      this.setState({
        profileRightItem: results,
        profileRightHash: ipfsHash,
      })
    })
    .then(() => {
      // get ipfs profile photo left
      const params = {
        address: address,
        fileType: 3,
        web3: web3,
      }
      return WalletHelpers.getIPFSDataWithType(params)
    })
    .then((results) => {

      let ipfsHash = null
      if (results){
        ipfsHash = results.ipfsHash
      }

      this.setState({
        profileLeftItem: results,
        profileLeftHash: ipfsHash,
      })
    })
    .catch((err) => {
      console.log("err: ", err)
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

  // request validation
  _requestValidation1 = () => {

    const { account_password, hnt_balance } = this.props

    // so far you don't need token
    // if (hnt_balance < 3) {
    //   Alert.alert(
    //     'Error',
    //     'Not enough HNT token',
    //     [
    //       {text: 'OK', onPress: () => console.log('OK Pressed')},
    //     ],
    //     { cancelable: true }
    //   )
    //   return;
    // }

    if (!account_password) {

      this.setState({
        nextStep: 'requestValidation',
      })

      this._showModal()

    } else {
      this._requestValidation2({ password: account_password })
    }
  }

  // request validation
  _requestValidation2 = ({ password }) => {

    console.log("_requestValidation2, 1")

    const { profileRightItem, profileLeftItem, profileLicenseItem, encryptedPrivacyFile } = this.state
    const { wallet, web3, profile } = this.props
    const userName = profile.name;

    const addresses = wallet.getAddresses()
    const address = addresses[0]

    let encrypted_user_key
    let tempPubkey
    let keyId
    let signedTX

    Promise.resolve()
    .then(() => {
      console.log("_requestValidation2, 2")
      return this._showSpinner({_spinnerText: 'requesting key...'})
    })
    .then(() => {
      // request temp pub key
      console.log("_requestValidation2, 3")
      const params = {}
      return MyAPI.requestTempPubkey({})
    })
    .then((results) => {
      console.log("_requestValidation2, 4")
      if (!results) {
        return Promise.reject("server error");
      }
      if (results.status === 'error') {
        return Promise.reject(results.message);
      }

      tempPubkey = results.publicKey2.split("___").join("\n")
      keyId = results.keyId
    })
    .then(() => {
      console.log("_requestValidation2, 5")
      // encrypt user's private key

      const params = {
        tempPubkey: tempPubkey,
        password: password,
      }
      console.log("encryptUserPrivateKey, params: ", params)
      return StorageHelpers.encryptUserPrivateKey(params)
    })
    .then((results) => {
      console.log("_requestValidation2, 6")
      encrypted_user_key = results
    })

    // front
    .then(() => {
      console.log("_requestValidation2, 7")
      const params = {
         password: password,
         _imageBase64: this.state.profileFrontBase64,
         _fileType: 1,
      }
      console.log("_uploadFile22, params: ", params)
      return this._uploadFile22(params)
    })
    .then(() => {
      // save image
      console.log("this.state.profileFrontBase64: ", this.state.profileFrontBase64)
      this._saveProfileImageOnStrage(this.state.profileFrontBase64)
    })

    // right
    .then(() => {
      console.log("_requestValidation2, 8")
      const params = {
         password: password,
         _imageBase64: this.state.profileRightBase64,
         _fileType: 2,
      }
      return this._uploadFile22(params)
    })

    // left
    .then(() => {
      console.log("_requestValidation2, 9")
      const params = {
         password: password,
         _imageBase64: this.state.profileLeftBase64,
         _fileType: 3,
      }
      return this._uploadFile22(params)
    })

    .then(() => {
      console.log("_requestValidation2, 10")
      return this._showSpinner({_spinnerText: 'preparing transaction...'})
    })

    .then(() => {
      // create signature
      console.log("_requestValidation2, 11")

      const params = {
        wallet: wallet,
        web3: web3,
        address: address,
        password: password,
      }
      return WalletHelpers.generateAddValidationRequestTX(params)
    })
    .then((results) => {
      signedTX = results
    })
    .then(() => {
      console.log("_requestValidation2, 12")
      return this._showSpinner({_spinnerText: 'sending transaction...'})
    })
    .then(() => {
      console.log("_requestValidation2, 13")
      // send encrypted private key and encryptedPrivacyFile
      const params = {
        keyId: keyId,
        encrypted_user_key: encrypted_user_key,
        encryptedPrivacyFile: encryptedPrivacyFile,
        signedTX: signedTX,
        address: address,
        userName: userName,
      }
      return MyAPI.requestValiationWithPrivatekey(params)
    })
    .then((results) => {
      // transaction sent
      console.log("_requestValidation2, 14:", results)

      if (!results) {
        return Promise.reject(Error("server error"))
      }
      if (results.status !== 'success') {
        return Promise.reject(Error(results.message))
      }

      // spinner stop
      this.setState({
        spinnerVisible: false,
      })

      const params = {
        userStatus: 2,
      }
      this.props.setUserStatus(params)
    })
    .then(() => {
      const params = {
        just_requested: true,
      }
      this.props.setJustRequested(params)
    })

    .then(() => {
      Alert.alert(
        'Success',
        'Validation requested',
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )
      return;
    })
    .catch((err) => {
      console.log("err:", err)
      this._showError({err: err})
    })
  }









  // uploda a file
  _uploadFile22 = ({ password, _imageBase64, _fileType }) => {

    let { imageBase64, fileType } = this.state
    let { wallet, web3, account_password } = this.props

    if ( !account_password && password ) {
      account_password = password
    }
    if (!imageBase64 && _imageBase64) {
      imageBase64 = _imageBase64
    }
    if (!fileType && _fileType) {
      fileType = _fileType
    }

    // let encrypted_data
    let ipfsHash

    let spinnerText = "processing..."
    if ( _fileType === 1 ) {
      spinnerText = "processing front..."
    } else if ( _fileType === 2 ) {
      spinnerText = "processing right..."
    } else if ( _fileType === 2 ) {
      spinnerText = "processing left..."
    }

    return Promise.resolve()
    .then(() => {
      return this._showSpinner({_spinnerText: spinnerText})
    })
    .then(() => {
      // uploda encrypted data
      const params = {
        imageBase64: imageBase64,
        fileType: fileType,
        wallet: wallet,
        web3: web3,
        account_password: account_password,
      }
      return ImageHelpers.uploadNormalFile(params)
    })
    .then((results) => {
      ipfsHash = results.ipfsHash
    })
    .then(() => {
      return this._showSpinner({_spinnerText: 'sending transaction...'})
    })
    .then(() => {
      // uploda encrypted data
      const params = {
        fileType: fileType,
        wallet: wallet,
        web3: web3,
        account_password: account_password,
        ipfsHash: ipfsHash,
      }
      return ImageHelpers.sendNormalFileTX(params)
    })
    .then((results) => {
      //
      console.log("results: ", results)
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

  // show modal
  _showModal = () => {
    this.setState({
      isModalVisible: true,
    })
  }

  // start uploading file
  _uploadFile1 = ({ _imageBase64, _fileType }) => {

    if (!_imageBase64) {
      console.log("no imageBase64 found")
      return;
    }
    if (!_fileType) {
      console.log("no fileType found")
      return;
    }

    if ( _fileType === 1 ){
      this.setState({
        profileFrontBase64: _imageBase64
      })

    } else if ( _fileType === 2 ) {
      this.setState({
        profileRightBase64: _imageBase64
      })
    } else if ( _fileType === 3 ) {
      this.setState({
        profileLeftBase64: _imageBase64
      })
    } else {
      console.log("invalid filetype")
      return;
    }


    // const params = {
    //   _imageBase64: _imageBase64,
    //   _fileType: _fileType,
    //   // password: account_password,
    // }
    // this._uploadFile2(params)

    return;

    // this.setState({
    //   imageBase64: _imageBase64,
    //   fileType: _fileType,
    // })
    //
    // const { account_password } = this.props
    // if (!account_password) {
    //   this.setState({
    //     nextStep: 'uploadFile',
    //   })
    //   this._showModal()
    // } else {
    //
    //   const params = {
    //     _imageBase64: _imageBase64,
    //     _fileType: _fileType,
    //     password: account_password,
    //   }
    //   this._uploadFile2(params)
    // }
  }


  // save image on local storage
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

      if (this.state.nextStep == 'uploadFile') {
        this._uploadFile2({password: password})
      } else if (this.state.nextStep == 'requestValidation') {
        this._requestValidation2({password: password})
      } else if (this.state.nextStep == 'uploadPrivacyFile') {
        this._uploadPrivacyFile2({password: password})
      }
    })
    .then(() => {
      this.setState({
        nextStep: null,
        // handlingItem: null,
      })
    })
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  // uploda a file
  _uploadFile2 = ({ password, _imageBase64, _fileType }) => {

    let { imageBase64, fileType } = this.state
    let { wallet, web3, account_password } = this.props

    if ( !account_password && password ) {
      account_password = password
    }
    if (!imageBase64 && _imageBase64) {
      imageBase64 = _imageBase64
    }
    if (!fileType && _fileType) {
      fileType = _fileType
    }

    // let encrypted_data
    let ipfsHash

    Promise.resolve()
    .then(() => {
      return this._showSpinner({_spinnerText: 'uploading data...'})
    })
    .then(() => {
      // uploda encrypted data
      const params = {
        imageBase64: imageBase64,
        fileType: fileType,
        wallet: wallet,
        web3: web3,
        account_password: account_password,
      }
      return ImageHelpers.uploadNormalFile(params)
    })
    .then((results) => {
      ipfsHash = results.ipfsHash
    })
    .then(() => {
      return this._showSpinner({_spinnerText: 'sending transaction...'})
    })
    .then(() => {
      // uploda encrypted data
      const params = {
        // imageBase64: imageBase64,
        fileType: fileType,
        wallet: wallet,
        web3: web3,
        account_password: account_password,
        ipfsHash: ipfsHash,
      }
      return ImageHelpers.sendNormalFileTX(params)
    })
    .then((results) => {
      // const docIdx = results.docIdx;

      // sucess
      if (fileType == 2) {
        this.setState({
          profileRightHash: ipfsHash
        })
      } else if (fileType == 3) {
        this.setState({
          profileLeftHash: ipfsHash
        })
      }

    })
    .then(() => {
      // success!
      this.setState({
        imageBase64: null,
        fileType: null,
        spinnerVisible: false,
      })
    })
    .catch((err) => {
      console.log("err: ", err)
      this._showError({ err: err })
    })
  }

  // close modal
  _closeModal = () => {
    this.setState({
      isModalVisible: false,
    })
  }

  // // see an image by decrypting it
  // _seeDocument = (item) => {
  //
  //   const { account_password } = this.props
  //
  //   const params = {
  //     ipfsHash: item.ipfsHash,
  //   }
  //   MyAPI.getEncodedData(params)
  //   .then((results) => {
  //     // decrypt data
  //
  //     if (!results) {
  //       return Promise.reject(Error("server error"))
  //     }
  //     if (results.status !== 'success') {
  //       return Promise.reject(Error(results.message))
  //     }
  //
  //     const encoded_data = results.encoded_data.trim()
  //     const params = {
  //       _data: encoded_data,
  //       password: account_password
  //     }
  //     return StorageHelpers.decrypt_data(params)
  //   })
  //   .then((results) => {
  //     // show the image
  //     this._showUploadedData(results.trim())
  //   })
  //   .catch((err) => {
  //     console.log("err:",err)
  //   })
  // }

  // image is ready, show the imamge
  _showUploadedData = (decrypt_data) => {
    this.setState({
      decryptData: decrypt_data,
    }, () => {
      this.setState({
        isDocumentModalVisible: true,
      })
    })
  }

  // close modal
  _closeDocumentModal = () => {
    this.setState({
      isDocumentModalVisible: false,
    })
  }

  //
  // privacy sensitive file
  //
  _uploadPrivacyFile1 = ({ _imageBase64, _fileType }) => {
    if (!_imageBase64) {
      console.log("NO _imageBase64")
      return;
    }
    if (!_fileType) {
      console.log("NO _fileType")
      return;
    }

    this.setState({
      imageBase64: _imageBase64,
      fileType: _fileType,
    })

    const { account_password } = this.props
    if (!account_password) {
      this.setState({
        nextStep: 'uploadPrivacyFile',
      })
      this._showModal()
    } else {

      const params = {
        _imageBase64: _imageBase64,
        _fileType: _fileType,
        password: account_password,
      }
      this._uploadPrivacyFile2(params)
    }
  }

  // uploda a file
  _uploadPrivacyFile2 = ({ password, _imageBase64, _fileType }) => {

    let { imageBase64, fileType } = this.state
    let { wallet, web3, account_password } = this.props

    if ( !account_password && password ) {
      account_password = password
    }
    if (!imageBase64 && _imageBase64) {
      imageBase64 = _imageBase64
    }
    if (!fileType && _fileType) {
      fileType = _fileType
    }

    // let encrypted_data
    let ipfsHash

    Promise.resolve()
    .then(() => {
      return this._showSpinner({_spinnerText: 'encrypting data...'})
    })
    .then(() => {
      // uploda encrypted data
      const params = {
        imageBase64: imageBase64,
        fileType: fileType,
        wallet: wallet,
        web3: web3,
        account_password: account_password,
      }
      return ImageHelpers.encryptPrivacyFile(params)
    })
    .then((results) => {

      const encrypted = results

      this.setState({
        privacyFileFlg: true,
        encryptedPrivacyFile: encrypted,
      })

    })
    .then(() => {
      // success!
      this.setState({
        imageBase64: null,
        fileType: null,
        spinnerVisible: false,
      })
    })
    .catch((err) => {
      console.log("err: ", err)
      this._showError({ err: err })

      this.setState({
        imageBase64: null,
        fileType: null,
        spinnerVisible: false,
      })
    })
  }

  render() {

    const {
      imageBase64,
      isModalVisible,
      uploadedItemArray,
      isDocumentModalVisible,
      decryptData,
      spinnerVisible,
      spinnerText,
      profileRightItem,
      profileRightHash,
      profileLeftItem,
      profileLeftHash,
      profileLicenseItem,
      privacyFileFlg,
      profileFrontBase64,
      profileRightBase64,
      profileLeftBase64,
    } = this.state

    const { profile, userStatus, just_requested } = this.props
    // const { userStatus } = this.state

    let showReqestButton = true
    if (userStatus === 2 || userStatus === 3) {
      showReqestButton = false
    }
    if (just_requested === true) {
      showReqestButton = false
    }

    // console.log(privacyFileFlg , profileFrontBase64 , profileLeftBase64 , showReqestButton)

    return (
      <View style={styles.container}>

      <ScrollView style={{
          flex: 1,
          marginBottom: 10,
        }}>

        <View style={{ flex: 1 }}>


        {/* profile name */}
        <View style={{
          marginTop: 10,
          borderBottomColor: '#cccccc',
          borderBottomWidth: 1,
          borderStyle: 'solid',
          paddingTop: 10,
          paddingBottom: 0,
        }}>

          <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
              <Text style={{
                fontSize: 12,
                color: hydraPink,
              }}>Name</Text>
          </View>

          <View style={{
              // flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              marginTop: 4,
            }}>
              <Text style={{
                  fontSize: 28,
                  color: '#777777',
                  marginTop: 12,
                  marginRight: 8,
                  marginLeft: 10,
                }}>
                {profile.name}
              </Text>
          </View>
        </View>


          {/* profile photo front */}
          <ProfilePhotoFileItem
            uploadFile1={this._uploadFile1}
            fileType={1}
            typeName="Profile Photo Front"
            item={profileRightItem}
            ipfsHash={profileRightHash} />

          {/* profile photo right */}
          <ProfilePhotoFileItem
            uploadFile1={this._uploadFile1}
            fileType={2}
            typeName="Profile Photo Right"
            item={profileRightItem}
            ipfsHash={profileRightHash} />

          {/* profile photo left */}
          <ProfilePhotoFileItem
            uploadFile1={this._uploadFile1}
            fileType={3}
            typeName="Profile Photo Left"
            item={profileLeftItem}
            ipfsHash={profileLeftHash} />


          {/* profile photo driver's license */}
          <PrivacySensitiveFileItem
            style={{
              marginBottom: 38,
            }}
            uploadFile1={this._uploadPrivacyFile1}
            fileType={4}
            typeName="Driver License"
            privacyFileFlg={privacyFileFlg}
            item={profileLicenseItem} />

          {/* validate button */}
          {privacyFileFlg && profileFrontBase64 && profileLeftBase64 && showReqestButton === true && (
            <View style={{
                marginTop: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 10,
              }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  backgroundColor: hydraPink,
                  flex: 1,
                  paddingTop: 12,
                  paddingBottom: 12,
                  borderRadius: 6,
                }}
                onPress={this._requestValidation1}>
                  <Text style={styles.submitBtnText}>Validation Request</Text>
              </TouchableOpacity>
            </View>
          )}

          {privacyFileFlg && profileFrontBase64 && profileLeftBase64 && showReqestButton === true && (
            <View style={{
                marginTop: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 38,
              }}>
              <Text>
                Please leave the app running once you click the upload button, the app will take few minuets to encrypt and upload the files. Once the profile is validated we will credit the tokens and send you a verification message
              </Text>
            </View>
          )}


        </View>


        {/* document modal */}
        <DocumentModal
          isModalVisible={isDocumentModalVisible}
          decryptData={decryptData}
          callbackWithFail={this._closeDocumentModal} />

        {/* password modal */}
        <PasswordModal
          isModalVisible={isModalVisible}
          callbackWithFail={this._closeModal}
          callbackWithSuccess={this._closeModalWithPassword} />

        {/* spinner */}
        <Spinner
          visible={spinnerVisible}
          textContent={spinnerText}
          textStyle={{color: '#FFF'}} />

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
    flexDirection: 'row',
    backgroundColor: hydraPink,
    padding: 10,
    borderRadius: 7,
    height: 45,
    width: '100%',
    marginTop:5,
    marginBottom:25,
    justifyContent: 'space-between',
  },
  AndroidSubmitLoginBtn: {
    flexDirection: 'row',
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
    justifyContent: 'space-between',
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: 'center',
  },
})

function mapStateToProps ({ user }) {

  if (user){
    return {
      wallet: user.wallet,
      web3: user.web3,
      account_password: user.account_password,
      profile: user.profile,
      userStatus: user.userStatus,
      hnt_balance: user.hnt_balance,
      just_requested: user.just_requested,
    }
  } else {
    return {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setUserStatus: (data) => dispatch(UserActions.setUserStatus({ params: data})),
    setPassword: (data) => dispatch(UserActions.setPassword({ params: data})),
    setProfile: (data) => dispatch(UserActions.setProfile({ params: data})),
    setJustRequested: (data) => dispatch(UserActions.setJustRequested({ params: data})),
  }
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(UploadFileView)
