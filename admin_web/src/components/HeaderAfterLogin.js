import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Row,
  Col,
} from 'reactstrap';
import * as MyAPI from '../utils/MyAPI'
import { LOCAL_STRAGE_USER_KEY } from '../utils/Settings'

class HeaderAfterLogin extends Component {

  // try to logout
  _logoutRequest = () => {

    const { login_token } = this.props
    const param = {
      login_token: login_token
    }

    MyAPI.logout(param)
    .then((results) => {

      localStorage.removeItem(LOCAL_STRAGE_USER_KEY);
      this.props.history.push("/")
      window.location.reload();
    })
    .catch((err) => {
      console.log("err:", err)
      
      localStorage.removeItem(LOCAL_STRAGE_USER_KEY);
      this.props.history.push("/")
      window.location.reload();
    })
  }

  render() {

    const { location } = this.props

    return(
      <Row style={{
          marginTop:60,
          marginBottom: 60,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: '#cccccc',
        }}>
        <Col xs="12" md="6" style={{textAlign: 'left'}}>

          <Link to="/dashboard" style={{
              color: location.pathname === '/dashboard' ? 'orange' : '#000000',
              marginRight: 16,
              textDecoration: 'none',
            }}>Dashboard</Link>

          <Link to="/account" style={{
              color: location.pathname === '/account' ? 'orange' : '#000000',
              marginRight: 16,
              textDecoration: 'none',
            }}>Account</Link>

        </Col>

        <Col xs="12" md="6" style={{textAlign: 'right'}}>
          <span style={{cursor: 'pointer'}} onClick={() => this._logoutRequest()}>Logout</span>
        </Col>
      </Row>
    )
  }
}

// react-redux
function mapStateToProps ( { user } ) {
  if (user){
    return {
      login_token: user.login_token,
    }
  } else {
    return {}
  }
}

export default withRouter( connect(mapStateToProps)( HeaderAfterLogin ) )
