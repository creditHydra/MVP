import { API_URL, API_KEY } from './Settings'

const headers = {
  'Accept': 'application/json',
  'Authorization': API_KEY
}

// create an account
export const createAccount = (params) =>
  fetch(`${API_URL}/api/give_token_to_new_user`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

// send Transaction for fileUploaded
export const sendTransactionForUploadFile = (params) =>
  fetch(`${API_URL}/api/send_transaction_for_upload_file`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


// get encoded data
export const getEncodedData = (params) =>
  fetch(`${API_URL}/api/get_encoded_data`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())



// get public key of validator
export const getPubKeyOfValidator = (params) =>
  fetch(`${API_URL}/api/get_public_key_of_validator`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


// // send encrypted data by validators public key
// export const sendEncryptedDataForValidation = (params) =>
//   fetch(`${API_URL}/api/send_encrypted_data_for_validation`, {
//     method: 'POST',
//     headers: {
//       ...headers,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify( params )
//   }).then(res => res.json())

//
// Ver 0.0.2s
//

// create light wallet
export const createLightWallet = (params) =>
  fetch(`${API_URL}/api/create_light_wallet`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

// create new public and private keys
export const generateKeypair = (params) =>
  fetch(`${API_URL}/api/generate_keypair`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


// upload file with public key
export const uploadFileAndPubkeys = (params) =>
  fetch(`${API_URL}/api/upload_file_and_pubkey`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

// upload file with public key
export const encryptPrivacyFileAndPubkeys = (params) =>
  fetch(`${API_URL}/api/encrypt_privacy_file_and_pubkey`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


export const requestTempPubkey = (params) =>
  fetch(`${API_URL}/api/request_temporary_pubkey`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

export const requestValiationWithPrivatekey = (params) =>
  fetch(`${API_URL}/api/request_validation_with_encrypted_privatekey`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())
