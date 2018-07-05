import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import {
  Container,
} from 'reactstrap';
import Loading from './Loading'
import HeaderAfterLogin from './HeaderAfterLogin'
import * as MyAPI from '../utils/MyAPI'
import ValidationRequestItem from './ValidationRequestItem'

// spinner
import { Loader } from 'react-overlay-loader';
import 'react-overlay-loader/styles.css';

// dashboard: this is home after login
class Dashboard extends Component {

  state = {
    requestList: [],
    loading: false,
  }

  componentDidMount() {

    const { login_token } = this.props

    if (login_token) {
      this._getValidationRequests(login_token)
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
      this._getValidationRequests(next_login_token)
    }
  }

  _getValidationRequests = (login_token) => {

    const params = {
      login_token: login_token
    }


    this.setState({
      loading: true,
    })

    MyAPI.getValidationRequests(params)
    .then((results) => {
      console.log("getValidationRequests: ", results)

      if (!results) {
        return Promise.reject(Error("server error"))
      }
      if (results.status !== 'success') {
        return Promise.reject(Error(results.message))
      }

      this.setState({
        requestList: results.request_list_2,
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

  // render view
  render() {

    const { profile, login_token, } = this.props
    const { requestList, loading } = this.state

    if ( !profile || !login_token ){
      return (<Loading text="loading..." />)
    }

    return(
      <Container className='dashboard' style={{textAlign: 'center'}}>

        {/* header */}
        <HeaderAfterLogin />

        {requestList.map((item) => (
          <ValidationRequestItem item={item} key={item._id} />
        ))}

        <Loader fullPage={true} loading={loading} />
      </Container>
    )
  }
}
// <span>{item.decrypted_base64}</span>

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

// function mapDispatchToProps (dispatch) {
//   return {
//     walletPrepared: (data) => dispatch(walletPrepared({ params: data})),
//   }
// }

export default withRouter( connect( mapStateToProps, null )(Dashboard) )
