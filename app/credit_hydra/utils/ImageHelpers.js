import {
  ImageEditor,
  ImageStore,
  Alert,
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker';
import * as MyAPI from './MyAPI'
import * as StorageHelpers from './StorageHelpers'
import * as WalletHelpers from '../utils/WalletHelpers'

// start uploading
export const uploadFileStart = ({_width, _height, _ios}) => {

  return new Promise((resolve, reject) => {

    Alert.alert(
      'Add Picture',
      '',
      [
        {text: 'Take Photo', onPress: () => {
          // Launch Camera:

          ImagePicker.openCamera({
            width: _width,
            height: _height,
            cropping: true
          }).then(image => {
            return getBase64({
              _image_uri: image.path,
              _width: _width,
              _height: _height,
              _ios: _ios,
            })
          })
          .then((results) => {
            resolve(results)
          })
          .catch((err) => {
            reject(err)
          })
        }},
        {text: 'Choose from Library', onPress: () => {
          // Open Image Library:
          ImagePicker.openPicker({
            width: _width,
            height: _height,
            cropping: true
          })
          .then(image => {
            return getBase64({
              _image_uri: image.path,
              _width: _width,
              _height: _height,
              _ios: _ios,
            })
          })
          .then((results) => {
            resolve(results)
          })
          .catch((err) => {
            reject(err)
          })
        }},
        {text: 'Cancel', onPress: () => console.log('OK Pressed 3'), style: 'cancel'},
      ],
      { cancelable: true }
    )

  })

}


// get base64 from image
getBase64 = ({ _image_uri, _width, _height, _ios}) => {

  let ImageStoreUri
  let imageBase64

  return Promise.resolve()
  .then(() => {
    return new Promise((resolve, reject) => {

      const cropData = {
        offset: { x: 0, y: 0 },
        size: { width: _width, height: _height}
      }

      ImageEditor.cropImage(
        _image_uri,
        cropData,
        (results) => {
          // get base64

          ImageStoreUri = results

          ImageStore.getBase64ForTag(ImageStoreUri, (results) => {
            resolve(results)
          }, (err) => {
            reject(err)
          })
        },
        (err) => {
          reject(err)
        },
      )
    })
  })
  .then((results) => {
    imageBase64 = results

    // iOS only?
    if (_ios === true) {
      ImageStore.removeImageForTag(ImageStoreUri)
    }

    return Promise.resolve(imageBase64)
  })
}








// uploda encrypted data
export const uploadNormalFile = ({ imageBase64, fileType, wallet, web3, account_password }) => {

  if (!account_password) {
    return Promise.reject(Error("no password found"))
  }

  const addresses = wallet.getAddresses()
  const address = addresses[0]

  // let encrypted_data
  let ipfsHash
  let publicKey
  let encrypted

  return Promise.resolve()
  .then(() => {
    // get publicKey
    return StorageHelpers.getCrypto2PublickeyFromStorage()
  })
  .then((results) => {
    if (!results) {
      return Promise.reject(Error("no keys found"))
    }

    publicKey = results.publicKey

    // create signature
    const params = {
      web3: web3,
      address: address,
      wallet: wallet,
      password: account_password,
      message: 'ratelnewtork is going to be great',
    }
    return WalletHelpers.makeSignatureOnMessage(params)
  })
  .then((results) => {
    const signedHash = results

    // send signature, publicKey, and image data
    const params = {
      signedHash: signedHash,
      address: address,
      imageBase64: imageBase64,
      publicKey2: publicKey.split("\n").join("___"),
    }
    return MyAPI.uploadFileAndPubkeys(params)
  })
  .then((results) => {
    if (!results) {
      return Promise.reject(Error("server error"))
    }
    if (results.status !== 'success') {
      return Promise.reject(Error(results.message))
    }

    const params = {
      ipfsHash: results.ipfsHash,
      // encrypted: results.encrypted,
    }

    return Promise.resolve(params)

    // // we will send ipfsHash at next API call
    // ipfsHash = results.ipfsHash
    // encrypted = results.encrypted
  })
  .catch((err) => {
    console.log(err)
  })
}



// uploda encrypted data
export const sendNormalFileTX = ({ fileType, wallet, web3, account_password, ipfsHash }) => {

  if (!account_password) {
    return Promise.reject(Error("no password found"))
  }

  const addresses = wallet.getAddresses()
  const address = addresses[0]

  return Promise.resolve()

  .then(() => {
    // generate signed TX

    const params = {
      wallet: wallet,
      web3: web3,
      address: address,
      password: account_password,
      ipfsHash: ipfsHash,
      fileType: fileType,
    }
    return WalletHelpers.generateFileUploadedTX(params)
  })
  .then((results) => {
    // send signatgure

    const signedTX = results

    const params = {
      signedTX: signedTX,
      address: address,
      ipfsHash: ipfsHash,
      fileType: fileType,
    }

    return MyAPI.sendTransactionForUploadFile(params)
  })
  .then((results) => {
    if (!results) {
      return Promise.reject(Error("server error"))
    }
    if (results.status !== 'success') {
      return Promise.reject(Error(results.message))
    }

    // looks okay
    const params = {
      docIdx: results.docIdx,
      // encrypted: encrypted,
    }
    return Promise.resolve(params);
  })
}



// uploda privacy data
export const encryptPrivacyFile = ({ imageBase64, fileType, wallet, web3, account_password }) => {

  if (!account_password) {
    return Promise.reject(Error("no password found"))
  }

  const addresses = wallet.getAddresses()
  const address = addresses[0]

  let publicKey
  let encrypted

  return Promise.resolve()
  .then(() => {
    // get publicKey
    return StorageHelpers.getCrypto2PublickeyFromStorage()
  })
  .then((results) => {
    publicKey = results.publicKey
    return Promise.resolve()
  })
  .then(() => {
    // const signedHash = results

    // send signature, publicKey, and image data
    const params = {
      // signedHash: signedHash,
      // address: address,
      imageBase64: imageBase64,
      publicKey2: publicKey.split("\n").join("___"),
    }
    return MyAPI.encryptPrivacyFileAndPubkeys(params)
  })
  .then((results) => {
    if (!results) {
      return Promise.reject(Error("server error"))
    }
    if (results.status !== 'success') {
      return Promise.reject(Error(results.message))
    }

    encrypted = results.encrypted
    return StorageHelpers.saveDLorPassportOnStorage(encrypted)
  })
  .then(() => {
    return Promise.resolve(encrypted)
  })
}
