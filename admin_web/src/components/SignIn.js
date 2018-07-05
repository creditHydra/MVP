import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
// import { Link } from 'react-router-dom'
import {
  Container,
  // Row,
  // Col,
} from 'reactstrap';
import LoginForm from './LoginForm'
import HeaderBeforeLogin from './HeaderBeforeLogin'

class SignIn extends Component {

  render() {

    return(
      <Container className='home' style={{textAlign: 'center'}}>

        {/* header */}
        <HeaderBeforeLogin />

        {/* form */}
        <LoginForm />

      </Container>
    )
  }
}

// export default withRouter(MainPage);
export default withRouter( connect()(SignIn) )
