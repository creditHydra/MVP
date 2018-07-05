import lightwallet from 'eth-lightwallet'
import HookedWeb3Provider from 'hooked-web3-provider'
import {
  RPC_SERVER,
  HNT_TOKEN_ADDRESS,
  HYDRA_MANAGER_ADDRESS,
} from './Settings'
import Web3 from 'web3'
import shortid from 'shortid'
import EthUtil from 'ethereumjs-util'
import HydraManagerJson from '../HydraStorage.json'
import TokenChildJson from '../TokenChild.json'
import crypto2 from 'crypto2';
const bs58 = require('bs58')
const EthereumTx = require('ethereumjs-tx')
var RLP = require('rlp');

let hnt_token = null
let hydra_manager = null

// crypto2 related

// generate public and private keys
export const generatePublicPrivateKeys = () => {

  return new Promise((resolve, reject) => {
    crypto2.createKeyPair((err, privateKey, publicKey) => {
      if (err) {
        reject(err)
      }

      const params = {
        privateKey: privateKey,
        publicKey: publicKey
      }
      resolve(params)
    });
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

      let flg  = wallet.isDerivedKeyCorrect(pwDerivedKey)
      if (flg !== true) {
        reject(Error("Incorrect derived key!"))
        return;
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



// associate wallet to
export const associateWalletWithWeb3 = ({ wallet, password }) => {

  if (!password) {
    return Promise.reject(Error("no password found"))
  }

  // let randomSeed = null
  //
  // if (seed_text){
  //   randomSeed = seed_text
  // } else {
  //   let extraEntropy = shortid.generate()
  //   randomSeed = lightwallet.keystore.generateRandomSeed(extraEntropy);
  // }

  // let wallet = null
  // let web3 = null

  return Promise.resolve()
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
      // seed_text: randomSeed,
    }
    return Promise.resolve(params)
  })
}


// show seed text
// so far we store keystore on the device
// but ideally we should be able to resore wallet at any device.
export const showSeed = ({ wallet, password }) => {

  if (!password) {
    return Promise.reject(Error("no password found"))
  }

  return new Promise( (resolve, reject) => {

    wallet.keyFromPassword( password, (err, pwDerivedKey) => {
      if (err) {
        resolve(Error(err))
      }

      let flg  = wallet.isDerivedKeyCorrect(pwDerivedKey)
      if (flg !== true) {
        reject(Error("Incorrect derived key!"))
        return;
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
  const WALLET_STRAGE_KEY = "WALLET-"+userId
  localStorage.removeItem(WALLET_STRAGE_KEY)
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

      let flg  = wallet.isDerivedKeyCorrect(pwDerivedKey)
      if (flg !== true) {
        reject(Error("Incorrect derived key!"))
        return;
      }

      // client-side
      const pKey = wallet.exportPrivateKey( address, pwDerivedKey )
      const pKeyx = new Buffer(pKey, 'hex');
      const messageHash = web3.utils.sha3(message)
      const messageHashx = new Buffer(messageHash.substr(2), 'hex');
      const signedMessage = EthUtil.ecsign(messageHashx, pKeyx)
      const signedHash = EthUtil.toRpcSig(signedMessage.v, signedMessage.r, signedMessage.s).toString('hex')

      // const params = {
      //   signedHash: signedHash
      // }
      resolve(signedHash)
    })
  })
}

// prepare contarct instance
// const prepareTokenContract =  ({ web3 }) => {
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

// check user status
export const checkUserStatus = ({web3, address}) => {

  return Promise.resolve()
  .then(() => {
    return prepareHydraManager({ web3: web3 })
    // return prepareTokenContract({ web3: web3 })
  })
  .then(() => {
    return hydra_manager.methods.addressToHydraUsers(address).call({
      from : address
    })
  })
}

// get ipfs hashes
export const getIPFSCount = ({address, web3}) => {
  return Promise.resolve()
  .then(() => {
    return prepareHydraManager({ web3: web3 })
  })
  .then(() => {
    return hydra_manager.methods.ipfsCount(address).call({
      from : address
    })
  })
}

// get ipfs data with address and index
export const getIPFSDataWithIdx = ({ address, idx, web3 }) => {
  return Promise.resolve()
  .then(() => {
    return prepareHydraManager({ web3: web3 })
  })
  .then(() => {
    return hydra_manager.methods.ipfsArray(address, idx).call({
      from : address
    })
  })
}

// get ipfs data with address and index
export const getIPFSDataWithType = ({ address, fileType, web3 }) => {
  return Promise.resolve()
  .then(() => {
    return prepareHydraManager({ web3: web3 })
  })
  .then(() => {
    return hydra_manager.methods.getUserFileWitType(address, fileType).call({
      from : address
    })
  })
  .then((results) => {

    if (results._fileType === "0") {
      return null;
    }

    const hash_func = parseInt(results._hash_func, 10).toString(16);
    const hash_val = results._hash_val.substr(2);
    const hash_size = parseInt(results._size, 10).toString(16);
    const uploaded_time = new Date(results._timestamp * 1000);
    const year = uploaded_time.getFullYear()
    const month = uploaded_time.getMonth() + 1;
    const date = uploaded_time.getDate()
    const uploaded = month+"/"+date+"/"+year
    const ipfsHash = hash_func+hash_size+hash_val
    const ipfsHashx = Buffer.from(ipfsHash, 'hex')

    const item = {
      ipfsHash: bs58.encode(ipfsHashx),
      uploaded: uploaded,
      // docIdx: idx,
      status: parseInt(results._status, 10),
      fileType: parseInt(results._fileType, 10),
    }
    return item;
  })
}

export const getAllIPFSData = ({ address, web3 }) => {

  let count
  let ipfs_hash_array = []

  return getIPFSCount({ address: address, web3: web3 })
  .then((results) => {

    count = parseInt(results, 10)

    // promise sequence
    return new Promise((resolve, reject) => {

      let sequence = Promise.resolve()

      for ( let idx=0; idx<count; idx++ ) {

        sequence = sequence.then(() => {
          // get ipfs data
          return getIPFSDataWithIdx({ address: address, idx: idx, web3: web3 })

        })
        .then((results) => {

          const hash_func = parseInt(results.hash_func, 10).toString(16);
          const hash_val = results.hash_val.substr(2);
          const hash_size = parseInt(results.size, 10).toString(16);
          const uploaded_time = new Date(results.timestamp * 1000);
          const year = uploaded_time.getFullYear()
          const month = uploaded_time.getMonth() + 1;
          const date = uploaded_time.getDate()
          const uploaded = month+"/"+date+"/"+year

          const ipfsHash = hash_func+hash_size+hash_val
          const ipfsHashx = Buffer.from(ipfsHash, 'hex')

          // create ipfs hash
          ipfs_hash_array.push({
            ipfsHash: bs58.encode(ipfsHashx),
            uploaded: uploaded,
            docIdx: idx,
            status: parseInt(results.status, 10),
            fileType: parseInt(results.fileType, 10),
          })
        })
        .then((results) => {
          if ( idx === ( count- 1 ) ){
            resolve()
          } else {
            return "OK"
          }
        })
        .catch((err) =>{
          console.log("err: ", err)

          if ( idx === ( count - 1 ) ){
            resolve()
          } else {
            return "NG"
          }
        })
      }
    })
  })
  .then(() => {
    return Promise.resolve(ipfs_hash_array.reverse())
  })
}


// generate raw transaction for "AddNewUser"
export const generateAddNewUserTX = ({ wallet, web3, address, password, phoneNumber }) => {

  let pKeyx
  let data_field
  // const phoneNumberx = "0x"+EthUtil.setLengthLeft(EthUtil.toBuffer(phoneNumber), 32).toString("hex");

  console.log("generateAddNewUserTX, 1, phoneNumber: ", phoneNumber)

  const phoneNumberHash = web3.utils.sha3(phoneNumber)
  console.log("phoneNumberHash:", phoneNumberHash)

  const phoneNumberHashx = new Buffer(phoneNumberHash, 'hex');
  console.log("phoneNumberHashx:", phoneNumberHashx)
  // const phoneNumberHexString = "0x"+phoneNumberHashx.toString("hex")

  const phoneNumberHexString = "0xabcd"

  // const phoneNumberHexString = "0x"+phoneNumberHash
  console.log("phoneNumberHexString:", phoneNumberHexString)

  return Promise.resolve()
  .then(() => {
    // get private key
    console.log("generateAddNewUserTX, 2")

    return new Promise((resolve, reject) => {
      wallet.keyFromPassword( password, (err, pwDerivedKey) => {
        if (err){
          reject(err)
        }

        let flg  = wallet.isDerivedKeyCorrect(pwDerivedKey)
        if (flg !== true) {
          reject(Error("Incorrect derived key!"))
          return;
        }

        const pKey = wallet.exportPrivateKey( address, pwDerivedKey )
        pKeyx = new Buffer(pKey, 'hex');

        resolve()
      })
    })
  })
  .then(() => {
    // prepare credit hydra manager contract instance

    console.log("generateAddNewUserTX, 3")

    return prepareHydraManager({ web3: web3 })
  })
  .then(() => {
    // get abi

    return hydra_manager.methods.addNewUser(
      address,
      phoneNumberHexString
    ).encodeABI();
  })
  .then((results) => {
    // now we have data field
    data_field = results

    console.log("generateAddNewUserTX, 4")

    console.log("hydra_manager: ", hydra_manager)
    console.log("address: ", address)
    console.log("phoneNumberHexString: ", phoneNumberHexString)

    // // get estimat Gas
    // return hydra_manager.methods.addNewUser(
    //   address,
    //   phoneNumberHexString
    // ).estimateGas()
  })
  .then((results) => {
    // now we have estimateGas
    // const estimateGas = parseInt(results ,10) + 100
    const estimateGas = 300000
    console.log("generateAddNewUserTX, 5, estimateGas: ", estimateGas)


    // let's create tx

    // nonce is always 0 because actuall transaction was sent from oracle
    const txParams = {
      nonce: '0x00',
      gasPrice: "0x"+parseInt(100000000000).toString(16),
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

// generate raw transaction for "fileUploaded"
export const generateFileUploadedTX = ({ wallet, web3, address, password,  ipfsHash, fileType }) => {

  let pKeyx
  let data_field

  // split ipfsHash
  const ipfsHash_hex = bs58.decode(ipfsHash).toString('hex')

  const func_type = parseInt(parseInt( "0x"+ipfsHash_hex.substr(0, 2) , "hex"), 10)
  const hash_size = parseInt(parseInt( "0x"+ipfsHash_hex.substr(2, 2) , "hex"), 10)
  const hash_value = "0x"+ipfsHash_hex.substr(4);

  return Promise.resolve()
  .then(() => {
    // get private key
    return new Promise((resolve, reject) => {
      wallet.keyFromPassword( password, (err, pwDerivedKey) => {
        if (err){
          reject(err)
        }

        let flg  = wallet.isDerivedKeyCorrect(pwDerivedKey)
        if (flg !== true) {
          reject(Error("Incorrect derived key!"))
          return;
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

    return hydra_manager.methods.fileUploaded(
      address,
      hash_value,
      func_type,
      hash_size,
      fileType
    ).encodeABI();
  })
  .then((results) => {
    // now we have data field
    data_field = results

    // // get estimat Gas
    // return hydra_manager.methods.fileUploaded(
    //   address,
    //   hash_value,
    //   func_type,
    //   hash_size,
    //   fileType
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
      gasPrice: "0x"+parseInt(100000000000).toString(16),
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

// generate raw transaction for "addValidationRequest"
export const generateAddValidationRequestTX = ({ wallet, web3, address, password }) => {

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

        let flg  = wallet.isDerivedKeyCorrect(pwDerivedKey)
        if (flg !== true) {
          reject(Error("Incorrect derived key!"))
          return;
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

    return hydra_manager.methods.addValidationRequest(
      address
    ).encodeABI();
  })
  .then((results) => {
    // now we have data field
    data_field = results

    // // get estimat Gas
    // return hydra_manager.methods.addValidationRequest(
    //   address
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
      gasPrice: "0x"+parseInt(100000000000).toString(16),
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
























// test function
export const testtest = ({ wallet, web3, address, to }) => {

  let pKeyx

  return Promise.resolve()
  .then(() => {
    return new Promise((resolve, reject) => {
      wallet.keyFromPassword( "12345678", (err, pwDerivedKey) => {
        if (err){
          reject(err)
        }

        let flg  = wallet.isDerivedKeyCorrect(pwDerivedKey)
        if (flg !== true) {
          reject(Error("Incorrect derived key!"))
          return;
        }

        const pKey = wallet.exportPrivateKey( address, pwDerivedKey )

        pKeyx = new Buffer(pKey, 'hex');

        resolve()
      })
    })
  })
  .then(() => {
    return prepareHNT({ web3: web3 })
  })
  .then(() => {
    return hnt_token.methods.transfer(to, 500).encodeABI();
  })
  .then((results) => {

    const _data = results

    // create tx
    const txParams = {
      nonce: '0x00',
      gasPrice: "0x"+parseInt(100000000000).toString(16),
      gasLimit: '0x2710',
      to: to,
      value: '0x00',
      data: _data,
    }

    var tx = new EthereumTx(txParams);

    tx.sign(pKeyx);

    const serializedTx = tx.serialize();

    const decoded = RLP.decode("0x"+serializedTx.toString('hex'))

    var tx2 = new EthereumTx(decoded);

    var tx2_raw = tx2.raw

    // for (let i=0; i<tx2_raw.length; i++) {
    //   console.log("i:"+i+" ", tx2_raw[i].toString('hex'))
    // }

    // // we can decode by https://github.com/ConsenSys/abi-decoder
    // // prepare ABI
    // abiDecoder.addABI(TokenChildJson.abi);
    // const orig_abi = "0x"+tx2_raw[5].toString('hex');
    // console.log("orig_abi: ", orig_abi)
    // // decode ABI
    // const decodedData = abiDecoder.decodeMethod(orig_abi);
    // console.log("decodedData: ", decodedData)
    //
    // if (tx2.verifySignature()) {
    //   console.log('Signature Checks out!')
    // } else {
    //   console.log("Nope")
    // }
  })
}
