import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
// import { Link } from 'react-router-dom'
import {
  Container,
  // Row,
  // Col,
 } from 'reactstrap';
import CreateAccontForm from './CreateAccontForm'
import HeaderBeforeLogin from './HeaderBeforeLogin'

// create an account
class CreateAccont extends Component {

  render() {

    return(

      <Container className='create_acount' style={{textAlign: 'center'}}>

        {/* header */}
        <HeaderBeforeLogin />

        {/* form */}
        <CreateAccontForm />

      </Container>

    )
  }
}

export default withRouter( connect( null )(CreateAccont) )
