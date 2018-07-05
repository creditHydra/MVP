

// import crypto2 from 'crypto2';
import lightwallet from 'eth-lightwallet'
import HookedWeb3Provider from 'hooked-web3-provider'
import {
  RPC_SERVER,
  HNT_TOKEN_ADDRESS,
  HYDRA_MANAGER_ADDRESS,
  VALIDATOR_PRIVATE_KEY,
} from './Settings'
import Web3 from 'web3'
import shortid from 'shortid'
import EthUtil from 'ethereumjs-util'
import HydraManagerJson from '../HydraStorage.json'
import TokenChildJson from '../TokenChild.json'
// const bs58 = require('bs58')
const EthereumTx = require('ethereumjs-tx')
// var RLP = require('rlp');
// const abiDecoder = require('abi-decoder'); // NodeJS
const crypto2 = require('crypto2');


let hnt_token = null
let hydra_manager = null

const prepareHydraManager =  ({ web3 }) => {
  return Promise.resolve()
  .then(() => {
    // get instance if needed
    if (hydra_manager !== null){
      return Promise.resolve()
    }
    return new web3.eth.Contract(HydraManagerJson.abi, HYDRA_MANAGER_ADDRESS)
  })
  .then((results) => {
    // set instance if needed
    if (hydra_manager !== null){
      return Promise.resolve()
    }
    hydra_manager = results
    return Promise.resolve()
  })
}

const prepareHNT =  ({ web3 }) => {
  return Promise.resolve()
  .then(() => {
    // get instance if needed
    if (hnt_token !== null){
      return Promise.resolve()
    }
    return new web3.eth.Contract(TokenChildJson.abi, HNT_TOKEN_ADDRESS)
  })
  .then((results) => {
    // set instance if needed
    if (hnt_token !== null){
      return Promise.resolve()
    }
    hnt_token = results
    return Promise.resolve()
  })
}


export const deserializeWallet = ({serialized_keystore}) => {
  return lightwallet.keystore.deserialize(serialized_keystore)
}

// set web3 provider
export const setWeb3Provider = ({ wallet }) => {

  if (!wallet){
    return Promise.reject(Error("no keystore found"))
  }

  var web3Provider = new HookedWeb3Provider({
    host: RPC_SERVER,
    transaction_signer: wallet
  });

  const web3 = new Web3(web3Provider);
  return Promise.resolve({web3: web3})
}

// add new eth address
const newAddresses = ({ wallet, password }) => {

  if (!wallet) {
    return Promise.reject(Error("no keystore found"))
  }

  if (!password) {
    return Promise.reject(Error("no password found"))
  }

  return new Promise((resolve, reject) => {

    wallet.keyFromPassword( password, (err, pwDerivedKey) => {

      if (err){
        reject(err)
      }

      // generate new address
      wallet.generateNewAddress(pwDerivedKey);
      resolve()
    })
  })
}

// create new wallet
export const createNewWallet = ({ seed_text, password }) => {

  if (!password) {
    return Promise.reject(Error("no password found"))
  }

  let randomSeed = null

  if (seed_text){
    randomSeed = seed_text
  } else {
    let extraEntropy = shortid.generate()
    randomSeed = lightwallet.keystore.generateRandomSeed(extraEntropy);
  }

  let wallet = null
  // let web3 = null

  return Promise.resolve()
  .then(() => {

    const params = {
      password: password,
      seedPhrase: randomSeed,
      hdPathString: "m/0'/0'/0'",
    }

    return new Promise((resolve, reject) => {

      // create vault
      lightwallet.keystore.createVault(params, (err, ks) => {
        if (err){
          reject(Error(err))
        }

        wallet = ks
        resolve()
      })
    })
  })
  .then(() => {
    // add new address

    const params = {
      wallet: wallet,
      password: password,
    }
    return newAddresses(params)
  })
  .then(() => {
    // get web3 provider
    return setWeb3Provider({ wallet: wallet })
  })
  .then(({web3}) => {
    // set web3

    const params = {
      web3: web3,
      wallet: wallet,
      seed_text: randomSeed,
    }
    return Promise.resolve(params)
  })
}


// show seed text
export const showSeed = ({ wallet, password }) => {

  return new Promise( (resolve, reject) => {

    wallet.keyFromPassword( password, (err, pwDerivedKey) => {
      if (err) {
        resolve(Error(err))
      }

      let seed = wallet.getSeed(pwDerivedKey);
      resolve(seed)
    })

  } )
}

// recover wallet from seed text
export const recoverWalletFromSeed = ({ seed_text, password }) => {

  if (!password) {
    return Promise.reject(Error("no password found"))
  }

  if (!seed_text) {
    return Promise.reject(Error("no seed text found"))
  }

  const params = {
    seed_text: seed_text,
    password: password,
  }
  return createNewWallet(params)
}

// destroy wallet
export const destroyWallet = ({ userId }) => {
  const storage_key = "WALLET-"+userId
  localStorage.removeItem(storage_key)
  return Promise.resolve()
}


// add one more eth address
// const addOneMoreAddress = ({ wallet, password }) => {
//
//   if (!password) {
//     return Promise.reject(Error("no password found"))
//   }
//
//   if (!wallet) {
//     return Promise.reject(Error("no keystore found"))
//   }
//
//   const params = {
//     wallet: wallet,
//     password: password,
//   }
//   return newAddresses(params)
// }



// create a signature on message
export const makeSignatureOnMessage = ({ web3, address, wallet, password, message }) => {

  return new Promise((resolve, reject) => {

    if (!password) {
      reject(Error("no password"))
    }

    wallet.keyFromPassword( password, (err, pwDerivedKey) => {
      if (err) {
        reject(Error(err))
        return;
      }

      // client-side
      const pKey = wallet.exportPrivateKey( address, pwDerivedKey )
      const pKeyx = new Buffer(pKey, 'hex');
      const messageHash = web3.utils.sha3(message)
      const messageHashx = new Buffer(messageHash.substr(2), 'hex');
      const signedMessage = EthUtil.ecsign(messageHashx, pKeyx)
      const signedHash = EthUtil.toRpcSig(signedMessage.v, signedMessage.r, signedMessage.s).toString('hex')

      const params = {
        signedHash: signedHash
      }
      resolve(params)
    })
  })
}

// // prepare contarct instance
// const prepareTokenContract =  ({ web3 }) => {
//   return Promise.resolve()
//   .then(() => {
//     // get instance if needed
//     if (tokenInstance !== null){
//       return Promise.resolve()
//     }
//     return new web3.eth.Contract(RatelExampleToken.abi, RatelExampleToken_Address)
//   })
//   .then((results) => {
//     // set instance if needed
//     if (tokenInstance !== null){
//       return Promise.resolve()
//     }
//     tokenInstance = results
//     return Promise.resolve()
//   })
// }

// retrieve token balance
export const checkTokenBalance = ({web3, address}) => {

  return Promise.resolve()
  .then(() => {
    return prepareHNT({ web3: web3 })
    // return prepareTokenContract({ web3: web3 })
  })
  .then(() => {
    return hnt_token.methods.balanceOf(address).call({
      from : address
    })
  })
}


// generate raw transaction for "addValidationRequest"
export const generateValidationCompletedTX = ({
  wallet,
  web3,
  address,
  password,
  validationStatus,
  requestIdx,
  encryptedProfileName }) => {

  let pKeyx
  let data_field

  return Promise.resolve()
  .then(() => {
    // get private key

    return new Promise((resolve, reject) => {
      wallet.keyFromPassword( password, (err, pwDerivedKey) => {
        if (err){
          reject(err)
        }

        const pKey = wallet.exportPrivateKey( address, pwDerivedKey )
        pKeyx = new Buffer(pKey, 'hex');

        resolve()
      })
    })
  })
  .then(() => {
    // prepare credit hydra manager contract instance
    return prepareHydraManager({ web3: web3 })
  })
  .then(() => {
    // get abi
    return hydra_manager.methods.validationCompleted(
      address,
      requestIdx,
      validationStatus,
      encryptedProfileName
    ).encodeABI();
  })
  .then((results) => {
    // now we have data field

    data_field = results

    // // get estimat Gas
    // return hydra_manager.methods.validationCompleted(
    //   address,
    //   requestIdx,
    //   validationStatus,
    //   encryptedProfileName
    // ).estimateGas()
  })
  .then((results) => {
    // now we have estimateGas

    // const estimateGas = parseInt(results ,10) + 100
    const estimateGas = 300000

    // let's create tx

    // nonce is always 0 because actuall transaction was sent from oracle
    const txParams = {
      nonce: '0x00',
      gasPrice: "0x"+parseInt(100000000000, 10).toString(16),
      gasLimit: "0x"+estimateGas.toString(16),
      to: HYDRA_MANAGER_ADDRESS,
      value: '0x00',
      data: data_field,
    }

    // create transaction
    var tx = new EthereumTx(txParams);
    // sign transaction
    tx.sign(pKeyx);

    // serialize transaction
    const serializedTx = tx.serialize();

    return Promise.resolve(serializedTx.toString('hex'))
  })
}

// export const decrypt_with_privateKey = () => {
//   return Promise.resolve()
// }

// decrypt
export const decrypt_with_privateKey = ({ _encrypted }) => {

  return Promise.resolve()
  .then(() => {

    return new Promise((resolve, reject) => {
      crypto2.decrypt.rsa(_encrypted, VALIDATOR_PRIVATE_KEY, (err, decrypted) => {
        if (err){
          reject(err)
        }
        resolve(decrypted)
      });
    })
  })
}

// decrypt
export const encrypt_with_publicKey = ({ _decrypted, _publicKey }) => {

  return Promise.resolve()
  .then(() => {

    return new Promise((resolve, reject) => {
      crypto2.encrypt.rsa(_decrypted, _publicKey, (err, encrypted) => {
        if (err){
          reject(err)
        }
        resolve(encrypted)
      });
    })
  })
}
