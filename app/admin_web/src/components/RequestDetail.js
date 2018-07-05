import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import {
  Container,
  Row,
  Col,
  Button,
} from 'reactstrap';
// import { LOCAL_STRAGE_KEY } from '../utils/Settings'
import Alert from 'react-s-alert';
import Loading from './Loading'
import HeaderAfterLogin from './HeaderAfterLogin'
import * as MyAPI from '../utils/MyAPI'
// import ValidationRequestItem from './ValidationRequestItem'
import queryString from 'query-string';
// import ValidationRequestDocItem from './ValidationRequestDocItem'
import * as WalletHelpers from '../utils/WalletHelpers'
import * as UserActions from '../actions/UserActions'

import { VALIDATOR_PRIVATE_KEY } from '../utils/Settings'
import SweetAlert from 'sweetalert-react';

// spinner
import { Loader } from 'react-overlay-loader';
import 'react-overlay-loader/styles.css';


// dashboard: this is home after login
class RequestDetail extends Component {

  state = {
    bc_requestIdx: null,
    keyId: null,
    decrypted_privacy_data: null,
    decrypted_front_data: null,
    decrypted_right_data: null,
    decrypted_left_data: null,
    loading: false,
    sweet_alert_show: false,
    validationStatus: 0,
    userName: null,
    encryptedProfileName: null,
  }

  componentDidMount() {

    const { location, login_token } = this.props
    const params = queryString.parse(location.search)

    if (!login_token) {
      this.props.history.push("/")
      return;
    }

    const keyId = params.item_id

    let tmp_publicKey
    let encrypted_with_tmp_key

    this.setState({
      keyId: keyId,
      loading: true,
    })

    Promise.resolve()
    .then(() => {
      // request temporary key
      const params = {
        login_token: login_token,
        keyId: keyId,
      }
      return MyAPI.RequestTemporaryPubkey(params)
    })
    .then((results) => {
      if (!results) {
        return Promise.reject(Error("server error"))
      }
      if (results.status === 'error') {
        return Promise.reject(Error(results.message))
      }

      tmp_publicKey = results.publicKey2.split("___").join("\n")

    })
    .then(() => {
      // encrypt validator key

      const params = {
        _decrypted: VALIDATOR_PRIVATE_KEY,
        _publicKey: tmp_publicKey,
      }
      return WalletHelpers.encrypt_with_publicKey(params)
    })
    .then((results) => {
      encrypted_with_tmp_key = results
    })
    .then(() => {
      return MyAPI.getValidationRequestDetail({
        keyId: params.item_id,
        login_token: login_token,
        encrypted_validator_key: encrypted_with_tmp_key,
       })
    })
    .then((results) => {
      if (!results) {
        return Promise.reject(Error("server error"))
      }
      if (results.status === 'error') {
        return Promise.reject(Error(results.message))
      }

      const decrypted_privacy_data = results.item.decrypted_privacy_data
      const decrypted_front_data = results.item.decrypted_front_data
      const decrypted_right_data = results.item.decrypted_right_data
      const decrypted_left_data = results.item.decrypted_left_data
      const userName = results.item.userName

      this.setState({
        bc_requestIdx: results.item.bc_requestIdx,
        decrypted_privacy_data: decrypted_privacy_data,
        decrypted_front_data: decrypted_front_data,
        decrypted_right_data: decrypted_right_data,
        decrypted_left_data: decrypted_left_data,
        userName: userName,
        encryptedProfileName: results.item.encryptedProfileName,
      })
    })
    .then((results) => {
      this.setState({
        loading: false,
      })
    })
    .catch((err) => {

      this.setState({
        loading: false,
      })

      console.log("err: ", err)
    })
  }


  // mark as validated
  _validate_docs1 = ({ validationStatus }) => {
    this.setState({
      validationStatus: validationStatus,
      sweet_alert_show: true,
    })
  }

  _sweetAlertConfirm = () => {
    this.setState({
      sweet_alert_show: false,
    })
    this._validate_docs2({ validationStatus: this.state.validationStatus })
  }

  // validationStatus 3: validated, 4: rejected
  _validate_docs2 = ({ validationStatus }) => {

    const { login_token, wallet, web3, address, account_password } = this.props
    const { keyId, bc_requestIdx, encryptedProfileName } = this.state

    let password
    if ( !account_password ) {
      password = prompt('Please enter your password.', 'Password');
      this.props.setPassword({ account_password: password, })
    }
    if (!wallet){
      return;
    }

    this.setState({
      loading: true,
    })

    Promise.resolve()
    .then(() => {
      wallet.passwordProvider = (callback) => {
        callback(null, password);
      };
    })
    .then(() => {
      // generate signature

      const params = {
        wallet: wallet,
        web3: web3,
        address: address,
        password: password,
        validationStatus: validationStatus,
        requestIdx: bc_requestIdx,
        encryptedProfileName: encryptedProfileName,
      }
      return WalletHelpers.generateValidationCompletedTX(params)
    })
    .then((results) => {
      // send parameters

      const signedTX = results;

      const params = {
        login_token: login_token,
        signedTX: signedTX,
        keyId: keyId,
        validationStatus: validationStatus,
        validatorAddr: address,
        bc_requestIdx: bc_requestIdx
      }

      return MyAPI.markAsValidated(params)
    })
    .then((results) => {
      // sent

      if (!results) {
        return Promise.reject(Error("server error"))
      }
      if (results.status !== 'success') {
        return Promise.reject(Error(results.message))
      }

      // okay
      Alert.success("Validated!")

      this.setState({
        loading: false,
      })
    })
    .catch((err) => {
      console.log("err: ", err)

      Alert.error(err.message)

      this.setState({
        loading: false,
      })
    })
  }

  // render view
  render() {

    const { profile, login_token, } = this.props
    const {
      decrypted_privacy_data,
      decrypted_front_data,
      decrypted_right_data,
      decrypted_left_data,
      userName,
      loading,
      sweet_alert_show,
    } = this.state

    if ( !profile || !login_token ){
      return (<Loading text="loading..." />)
    }

    return(
      <Container className='dashboard' style={{textAlign: 'center'}}>

        {/* header */}
        <HeaderAfterLogin />

          <Row style={{
            marginTop: 10,
            marginBottom: 10,
          }}>
            <Col>
              Name: {userName}
            </Col>
          </Row>

        <Row style={{
          marginTop: 10,
          marginBottom: 10,
        }}>
          <Col>
            {decrypted_privacy_data && (
              <img src={`data:image/png;base64,${decrypted_privacy_data}`} alt="Red dot" style={{
              }} />
            )}
          </Col>
        </Row>
        <Row style={{
          marginTop: 10,
          marginBottom: 10,
        }}>
          <Col>
            {decrypted_front_data && (
              <img src={`data:image/png;base64,${decrypted_front_data}`} alt="Red dot" style={{
              }} />
            )}

          </Col>
        </Row>
        <Row style={{
          marginTop: 10,
          marginBottom: 10,
        }}>
          <Col>
            {decrypted_right_data && (
              <img src={`data:image/png;base64,${decrypted_right_data}`} alt="Red dot" style={{
              }} />
            )}

          </Col>
        </Row>
        <Row style={{
          marginTop: 10,
          marginBottom: 10,
        }}>
          <Col>
            {decrypted_left_data && (
              <img src={`data:image/png;base64,${decrypted_left_data}`} alt="Red dot" style={{
              }} />
            )}

          </Col>
        </Row>

        {decrypted_left_data && (
          <Row style={{
            marginTop: 10,
            marginBottom: 10,
          }}>
            <Col md="6" xs="12">
              <Button
                style={{
                  width: '100%'
                }}
                color="warning"
                onClick={() => this._validate_docs1({ validationStatus: 4 })}>
                Meh...
              </Button>
            </Col>
            <Col md="6" xs="12">
              <Button
                style={{
                  width: '100%'
                }}
                color="primary"
                onClick={() => this._validate_docs1({ validationStatus: 3 })}>
                Looks good.
              </Button>
            </Col>

          </Row>
        )}


        <SweetAlert
          show={sweet_alert_show}
          title="are you sure?"
          text="once we submit, no return!"
          showCancelButton={true}
          onCancel={() => this.setState({ sweet_alert_show: false })}
          onConfirm={this._sweetAlertConfirm}
        />

        <Loader fullPage loading={loading} />
      </Container>
    )
  }
}
// <span>{item.decrypted_base64}</span>

// react-redux
function mapStateToProps ( { user } ) {

  if (user){

    let address = null
    if (user.wallet){
      const addresses = user.wallet.getAddresses()
      address = addresses[0]
    }

    return {
      userId: user._id,
      address: address,
      web3: user.web3,
      wallet: user.wallet,
      ready: user.ready,
      profile: user.profile,
      login_token: user.login_token,
    }
  } else {
    return {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setPassword: (data) => dispatch(UserActions.setPassword({ params: data})),
  }
}

export default withRouter( connect( mapStateToProps, mapDispatchToProps )(RequestDetail) )
