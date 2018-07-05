import { AsyncStorage } from 'react-native'
import {
  LOCAL_STRAGE_WALLET_KEY,
  LOCAL_STRAGE_PROFILE_KEY,
  LOCAL_STRAGE_CRYPTO2_KEY,
  LOCAL_STRAGE_PRIVACY_DATA,
} from './Settings'
import lightwallet from 'eth-lightwallet'
import crypto2 from 'crypto2';

// save
export function saveWalletOnStorage (wallet) {
  return AsyncStorage.setItem(LOCAL_STRAGE_WALLET_KEY, wallet.serialize(wallet))
}

// get
export function getWalletFromStorage () {
  return AsyncStorage.getItem(LOCAL_STRAGE_WALLET_KEY)
  .then((results) => {

    if (results){
      return lightwallet.keystore.deserialize(results)
    } else {
      return null;
    }
  })
}

// get 2
export function deserializeWallet({ wallet_sel }) {
  return lightwallet.keystore.deserialize(wallet_sel)
}

// remove wallet
export function removeWalletFromStorage () {
  return AsyncStorage.removeItem(LOCAL_STRAGE_WALLET_KEY)
}

// profile

// save profile
export function saveProfileOnStorage (profile) {
  return AsyncStorage.setItem(LOCAL_STRAGE_PROFILE_KEY, JSON.stringify(profile))
}

// save profile
export function saveProfileOnStorage2 (profile) {

  let privateKey;
  let publicKey;

  return getCrypto2PublickeyFromStorage()
  .then((results) => {
    // privateKey = results.privateKey
    publicKey = results.publicKey

    // encrypt
    return new Promise((resolve, reject) => {
      crypto2.encrypt.rsa( JSON.stringify(profile), publicKey, (err, encrypted) => {
        if (err){
          reject(err)
        }
        resolve(encrypted)
      });
    })
  })
  .then((results) => {
    return AsyncStorage.setItem(LOCAL_STRAGE_PROFILE_KEY, results)
  })
}


// get profile
export function getProfileFromStorage () {

  return AsyncStorage.getItem(LOCAL_STRAGE_PROFILE_KEY)
  .then((results) => {
    if (results){
      return JSON.parse(results)
    } else {
      return null;
    }
  })
}

// // get profile
// export function getProfileFromStorage2 ({ password }) {
//
//   let privateKey;
//   let publicKey;
//
//   return getCrypto2KeysFromStorage({ password: password })
//   .then((results) => {
//     privateKey = results.privateKey
//     publicKey = results.publicKey
//     return AsyncStorage.getItem(LOCAL_STRAGE_PROFILE_KEY)
//   })
//   .then((results) => {
//
//     if (!results) {
//       return Promise.resolve()
//     }
//
//     return new Promise((resolve, reject) => {
//       crypto2.decrypt.rsa(results, privateKey, (err, decrypted) => {
//         if (err){
//           reject(err)
//         }
//         resolve(decrypted)
//       });
//     })
//   })
//   .then((results) => {
//     if (results){
//       return JSON.parse(results)
//     } else {
//       return null;
//     }
//   })
// }

// remove profile
export function removeProfileFromStorage () {
  return AsyncStorage.removeItem(LOCAL_STRAGE_PROFILE_KEY)
}

// crypto2

// save public and private keys
export function saveCrypto2KeysOnStorage ({privateKey, publicKey, password}) {
  
  console.log("saveCrypto2KeysOnStorage, password: ", password)
  
  const privateKey2 = privateKey.split("\n").join("___").trim()
  
  Promise.resolve()
  .then(() => {
    
    return new Promise((resolve, reject) => {
      crypto2.encrypt(privateKey2, password, (err, results) => {
        if (err){
          reject(err);
        } else {
          resolve(results)
        }
      });
    })

  })
  .then((results) => {
    
    const privateKeyEncrypted = results

    // let publicKey = keys.publicKey;
    const publicKey2 = publicKey.split("\n").join("___")

    const param = {
      privateKeyEncrypted: privateKeyEncrypted,
      publicKey2: publicKey2,
    }
    
    return AsyncStorage.setItem(LOCAL_STRAGE_CRYPTO2_KEY, JSON.stringify(param))
  })
}

// get public and private keys
export function getCrypto2KeysFromStorage ({ password }) {

  let publicKey2

  return AsyncStorage.getItem(LOCAL_STRAGE_CRYPTO2_KEY)
  .then((results) => {

    if (!results) {
      return Promise.resolve()
    }

    let keys = JSON.parse(results)

    publicKey2 = keys.publicKey2

    // decrypt
    return new Promise((resolve, reject) => {
      
      console.log("keys.privateKeyEncrypted: ", keys.privateKeyEncrypted)
      console.log("password:", password)
      
      crypto2.decrypt(keys.privateKeyEncrypted, password, (err, results) => {
        if (err) {
          console.log("err: ", err)
          reject(err)
        } else {
          resolve(results)
        }
      });
    })
  })
  .then((results) => {
    const privateKey2 = results

    const privateKey = privateKey2.split("___").join("\n")
    const publicKey = publicKey2.split("___").join("\n")

    const params = {
      privateKey: privateKey,
      publicKey: publicKey,
    }
    
    return params;
  })
}


// get only public keys
export function getCrypto2PublickeyFromStorage () {
  
  return AsyncStorage.getItem(LOCAL_STRAGE_CRYPTO2_KEY)
  .then((results) => {

    if (!results) {
      return Promise.resolve()
    }

    const keys = JSON.parse(results)
    const publicKey = keys.publicKey2.split("___").join("\n")
    
    const params = {
      publicKey: publicKey,
    }
    return params;
  })
}

// remove profile
export function removeCrypto2KeysFromStorage () {
  return AsyncStorage.removeItem(LOCAL_STRAGE_CRYPTO2_KEY)
}

//
// encrypt image
//
export function encrypt_data (_data) {

  // let privateKey;
  let publicKey;

  return getCrypto2PublickeyFromStorage()
  .then((results) => {

    publicKey = results.publicKey

    // encrypt
    return new Promise((resolve, reject) => {
      crypto2.encrypt.rsa( JSON.stringify(_data), publicKey, (err, encrypted) => {
        if (err){
          reject(err)
        }
        resolve(encrypted)
      });
    })
  })
  .then((results) => {
    return Promise.resolve(results);
  })
}

// decrypt image
export function decrypt_data ({ _data, password}) {

  let privateKey;
  // let publicKey;

  return getCrypto2KeysFromStorage({ password: password })
  .then((results) => {
    privateKey = results.privateKey

    // encrypt
    return new Promise((resolve, reject) => {
      crypto2.decrypt.rsa( _data, privateKey, (err, decrypted) => {
        if (err){
          reject(err)
        }
        resolve(decrypted)
      });
    })
  })
  .then((results) => {
    return Promise.resolve(results);
  })
}

// encrypt data with public key
export function encrypt_data_with_pubkey ({ _data, _pubkey }) {

  // encrypt
  return new Promise((resolve, reject) => {
    crypto2.encrypt.rsa( _data, _pubkey, (err, encrypted) => {
      if (err){
        reject(err)
      }
      resolve(encrypted)
    });
  })
}

// encrypt user's private key with temporary public key
export const encryptUserPrivateKey = ({ tempPubkey, password }) => {

  return getCrypto2KeysFromStorage({password: password})
  .then((results) => {

    const privateKey2 = results.privateKey.split("\n").join("___")

    // encrypt
    return new Promise((resolve, reject) => {
      crypto2.encrypt.rsa( privateKey2, tempPubkey, (err, encrypted) => {
        if (err){
          reject(err)
        }
        resolve(encrypted)
      });
    })
  })
  .then((results) => {
    return Promise.resolve(results);
  })
}

// export function save_temporary_data({ strage_key, data_string }) {
//   return Promise.resolve()
//   .then(() => {
//     return AsyncStorage.setItem( strage_key, data_string )
//   })
// }
//
// export function get_temporary_data({ strage_key }) {
//   return Promise.resolve()
//   .then(() => {
//     return AsyncStorage.getItem( strage_key )
//   })
// }
//
// export function remove_temporary_data({ strage_key }) {
//   return Promise.resolve()
//   .then(() => {
//     return AsyncStorage.removeItem( strage_key )
//   })
// }

//
// Privacy Sensitive data
//

// save encrypted license or passpord
export const saveDLorPassportOnStorage = (encrypted) => {
  return AsyncStorage.setItem(LOCAL_STRAGE_PRIVACY_DATA, encrypted)
}
export const getDLorPassportOnStorage = () => {
  return AsyncStorage.getItem(LOCAL_STRAGE_PRIVACY_DATA)
}
