import React, { Component } from 'react';
import '../App.css';
import { Route, Switch } from 'react-router-dom'
import Dashboard from './Dashboard'
import Home from './Home'
import NoMatch from './NoMatch'
import CreateAccont from './CreateAccont'
import SignIn from './SignIn'
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import * as MyAPI from '../utils/MyAPI'
import { connect } from 'react-redux'
import { withRouter } from 'react-router';
import { LOCAL_STRAGE_USER_KEY } from '../utils/Settings'
import * as WalletHelpers from '../utils/WalletHelpers'
import AccountManager from './AccountManager'
import * as UserActions from '../actions/UserActions'
import RequestDetail from './RequestDetail'
// import SmartContractWatcher from './exp/SmartContractWatcher'

class App extends Component {

  // check if signin data is stored in local storage
  // if so, then signin
  componentDidMount() {

    // check if we have auth data on local storage
    const storage_data = localStorage.getItem(LOCAL_STRAGE_USER_KEY)
    if (!storage_data) {
      // no token was found...
      return;
    }

    // parse it
    let storage_json = null
    try {
      storage_json = JSON.parse(storage_data)
    } catch (err) {
      // parse error
      console.log("err:", err)
      return;
    }

    // let wallet = null
    let userId = null

    if ( storage_json && storage_json.login_token ) {
      this.signinWithTokenRequest(storage_json.login_token)
      .then(({ user }) => {
        // user is singed in!

        // get wallet form storage

        userId = user._id

        const storage_key = "WALLET-"+userId
        const serialized_keystore = localStorage.getItem(storage_key)
        if (!serialized_keystore) {
          return Promise.reject(Error("no key found"))
        }

        const wallet = WalletHelpers.deserializeWallet({serialized_keystore: serialized_keystore})

        console.log("wallet:")
        console.log(wallet)

        // update pros
        this.props.setWallet({ wallet: wallet })

        // set web3 provider
        return WalletHelpers.setWeb3Provider({ wallet: wallet })
      })
      .then(( { web3 } ) => {
        // update props
        this.props.setWeb3({ web3: web3 })
      })
      .catch((err) => {
        console.log("err:", err)

        if ( userId ) {
          const storage_key = "WALLET-"+userId
          localStorage.removeItem(storage_key);
        }
      })
    } else {
      // stored file did not contain login_token...
      console.log("stored file did not contain login_token...")
    }
  }

  // login with token
  signinWithTokenRequest = (login_token) => {

    const param = {
      login_token: login_token
    }

    return MyAPI.signinWithToken(param)
    .then((data) => {

      if (data.status !== 'success'){
        return Promise.reject('error')
      } else {
        // success
        const params = {
          user: data.user,
          login_token: data.login_token,
          // app_info: data.app_info,
        }
        localStorage.setItem(LOCAL_STRAGE_USER_KEY, JSON.stringify(params))
        this.props.loginSuccess(params)
        return Promise.resolve(params)
      }
    })
    // .then(() => {
    //   this.props.history.push("/dashboard")
    // })
    .catch((err) => {
      console.log("err:", err)

      localStorage.removeItem(LOCAL_STRAGE_USER_KEY);
      this.props.loginFailed()
    })
  }

  // render view
  render() {

    const { profile, login_token, } = this.props

    if ( profile && login_token ){

      return(
        <div className="App">

          <Switch>

            <Route exact path='/' render={() => (
              <Dashboard />
            )} />

            <Route exact path='/dashboard' render={() => (
              <Dashboard />
            )} />

            <Route exact path='/account' render={() => (
              <AccountManager />
            )} />

            <Route exact path='/create_acount' render={() => (
              <CreateAccont />
            )} />

            <Route exact path='/signin' render={() => (
              <SignIn />
            )} />


            <Route exact path='/request_detail' render={() => (
              <RequestDetail />
            )} />
            
            <Route exact path='/notfound' component={NoMatch} />

            <Route component={NoMatch} />

          </Switch>

          <Alert stack={{limit: 3}} />

        </div>
      )
    }

    return (
      <div className="App">

        <Switch>

          <Route exact path='/' render={() => (
            <Home />
          )} />

          <Route exact path='/dashboard' render={() => (
            <Dashboard />
          )} />

          <Route exact path='/account' render={() => (
            <AccountManager />
          )} />

          <Route exact path='/create_acount' render={() => (
            <CreateAccont />
          )} />

          <Route exact path='/signin' render={() => (
            <SignIn />
          )} />

          <Route exact path='/request_detail' render={() => (
            <RequestDetail />
          )} />

          <Route exact path='/notfound' component={NoMatch} />

          <Route component={NoMatch} />

        </Switch>

        <Alert stack={{limit: 3}} />

      </div>
    );
  }
}

// react-redux
function mapStateToProps ( { user } ) {

  if (user){

    return {
      userId: user._id,
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
    loginSuccess: (data) => dispatch(UserActions.loginSuccess({ params: data})),
    loginFailed: () => dispatch(UserActions.loginFailed()),
    setWallet: (data) => dispatch(UserActions.setWallet({ params: data})),
    setWeb3: (data) => dispatch(UserActions.setWeb3({ params: data})),
  }
}

export default withRouter(connect( mapStateToProps, mapDispatchToProps )(App))
