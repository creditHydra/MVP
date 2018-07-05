import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import {
  Container,
  Row,
  Col,
  Button,
} from 'reactstrap';
import Alert from 'react-s-alert';
import Loading from './Loading'
import HeaderAfterLogin from './HeaderAfterLogin'
import * as UserActions from '../actions/UserActions'
import * as WalletHelpers from '../utils/WalletHelpers'
import SweetAlert from 'sweetalert-react';

// spinner
import { Loader } from 'react-overlay-loader';
import 'react-overlay-loader/styles.css';

// dashboard: this is home after login
class AccountManager extends Component {

  state = {
    sweet_alert_show: false,
    sweet_alert_title: '',
    sweet_alert_message: '',
    sweet_alert_show_cancel: false,
    sweet_alert_action: '',
    loading: false,
    hnt_token_balance: 0,
  }

  componentDidMount() {

    const { login_token } = this.props
    if (login_token) {
      this._userReady(login_token)
    }
  }

  // detect props changed
  componentWillReceiveProps(nextProps) {

    // current state
    let current_login_token = null
    if ( this.props && this.props.login_token ){
      current_login_token = this.props.login_token
    }

    // next state
    let next_login_token = null
    if (nextProps && nextProps.login_token) {
      next_login_token = nextProps.login_token
    }

    if ( current_login_token !==  next_login_token){
      this._userReady(next_login_token)
    }
  }

  // user is ready
  _userReady = (login_token) => {
    // if user has address, then check balance
    const { web3 } = this.props
    if (web3) {
      this._checkBalance()
    }
  }

  _checkBalance = () => {

    const { web3, wallet } = this.props
    const addresses = wallet.getAddresses()
    const address = addresses[0]

    const params = {
      address: address,
      web3: web3,
    }
    WalletHelpers.checkTokenBalance(params)
    .then((results) => {
      this.setState({
        hnt_token_balance: parseInt(results, 10)
      })
    })
    .catch((err) => {
      console.log("err:", err)
    })
  }

  // create new wallet
  _createNewWallet = ({ seed_text }) => {

    const { userId } = this.props

    const password = prompt('Please enter your password.', 'Password');
    this.props.setPassword({ account_password: password, })

    let newWallet
    let newWeb3

    // we don't check password here because this is the place we set password
    Promise.resolve()
    .then(() => {
      this.setState({
        loading: true,
      })
    })

    .then(() => {

      const params = {
        seed_text: seed_text,
        password: password,
      }
      return WalletHelpers.createNewWallet(params)
    })
    .then(({ web3, wallet, seed_text }) => {
      // wallet is created

      // get balance

      newWallet = wallet
      newWeb3 = web3

      newWallet.passwordProvider = (callback) => {
        callback(null, password);
      };

      // return this._getBalances(newWeb3, newWallet)
    })
    .then(() => {
      // save keystore

      const storage_key = "WALLET-"+userId

      const serialized_keystore = newWallet.serialize()
      localStorage.setItem( storage_key, serialized_keystore )
    })
    .then(() => {
      // key is saved
      // lets update web3 props

      const params = {
        web3: newWeb3
      }
      this.props.setWeb3(params)
    })
    .then(() => {
      this.setState({
        loading: false,
      })
    })
    .then(() => {
      // lets update wallet props
      const params = {
        wallet: newWallet,
      }
      this.props.setWallet(params)
    })
    .catch((err) => {
      console.log("err: ", err)

      // reset password if something go wrong
      this.props.setPassword({ account_password: null, })

      Alert.error(err.message, {
        position: 'top-right',
        effect: 'slide',
        timeout: 5000
      });
    })
  }

  _destoryWallet1 = () => {
    this.setState({
      sweet_alert_show: true,
      sweet_alert_title: 'Seed text',
      sweet_alert_message: "Are yor really want to destory your wallet?",
      sweet_alert_show_cancel: true,
      sweet_alert_action: 'destory'
    })
  }

  // destory wallet
  _destoryWallet2 = () => {

    const { userId } = this.props

    WalletHelpers.destroyWallet({ userId: userId })
    .then(() => {
      this.props.setWallet({ wallet: null })
      this.props.setWeb3({ web3: null })
    })
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  // recover wallet from seed text
  _restoreWalletFromSeed = () => {
    const seed_text = prompt('Please enter your seed text.', 'Seed text');
    this._createNewWallet({seed_text: seed_text})
  }

  _showText = () => {

    const { wallet, account_password } = this.props

    // set passworl if needed
    let password = null;
    if (!account_password) {
      password = prompt('Please enter your password.', 'Password');
    } else {
      password = account_password
    }

    Promise.resolve()
    .then(() => {
      // update props
      this.props.setPassword({ account_password: password })
      wallet.passwordProvider = (callback) => {
        callback(null, password);
      };

    })
    .then(() => {
      const params = {
        wallet: wallet,
        password: password,
      }
      return WalletHelpers.showSeed(params)
    })
    .then((results) => {

      this.setState({
        sweet_alert_show: true,
        sweet_alert_title: 'Seed text',
        sweet_alert_message: results,
        sweet_alert_show_cancel: false,
        sweet_alert_action: 'showSeed'
      })
    })
    .catch((err) => {
      console.log("err: ", err)

      this.props.setPassword({ account_password: null })

      Alert.error(err.message, {
        position: 'top-right',
        effect: 'slide',
        timeout: 5000
      });
    })
  }

  _sweetAlertConfirm = () => {
    console.log("_sweetAlertConfirm")
    this.setState({
      sweet_alert_show: false,
    })

    if (this.state.sweet_alert_action === 'destory') {
      this._destoryWallet2()
    }
  }

  render() {

    const { profile, login_token, address } = this.props
    const {
      sweet_alert_show,
      sweet_alert_title,
      sweet_alert_message,
      loading,
      sweet_alert_show_cancel,
      hnt_token_balance,
    } = this.state

    if ( !profile || !login_token ){
      return (<Loading text="loading..." />)
    }

    return(
      <Container className='dashboard' style={{textAlign: 'center'}}>

        {/* header */}
        <HeaderAfterLogin />

        {address && (
          <Row style={{
              paddingTop: 6,
              marginBottom: 20,
            }}>
            <Col md="3" xs="12">
              Your HNT token
            </Col>
            <Col md="3" xs="12">
              {hnt_token_balance}
            </Col>
            <Col md="6" xs="12" />
          </Row>

        )}

        <Row>

          <Col md="6" xs="12" style={{
              paddingTop: 6,
            }}>
            Your address: {address ? (
              <span>{address}</span>
            ) : (
              <span>No account found</span>
            )}
          </Col>

          {address ? (
            <Col md="3" xs="12">
              <Button
                color="success"
                onClick={this._showText}>
                Show seed text
              </Button>
            </Col>
          ) : (
            <Col md="3" xs="12">
              <Button
                color="success"
                onClick={this._createNewWallet}>
                Create a wallet
              </Button>
            </Col>
          )}

          {address ? (
            <Col md="3" xs="12">
              <Button
                color="danger"
                onClick={this._destoryWallet1}>
                Destroy wallet
              </Button>
            </Col>
          ) : (
            <Col md="3" xs="12">
              <Button
                color="success"
                onClick={this._restoreWalletFromSeed}>
                Restore a wallet
              </Button>
            </Col>
          )}


        </Row>

        <SweetAlert
          show={sweet_alert_show}
          title={sweet_alert_title}
          text={sweet_alert_message}
          showCancelButton={sweet_alert_show_cancel}
          onCancel={() => this.setState({ sweet_alert_show: false })}
          onConfirm={this._sweetAlertConfirm}
        />

        <Loader fullPage={true} loading={loading} />

      </Container>
    )
  }
}

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
    setWallet: (data) => dispatch(UserActions.setWallet({ params: data})),
    setWeb3: (data) => dispatch(UserActions.setWeb3({ params: data})),
    setPassword: (data) => dispatch(UserActions.setPassword({ params: data})),
  }
}

export default withRouter( connect( mapStateToProps, mapDispatchToProps )(AccountManager) )
