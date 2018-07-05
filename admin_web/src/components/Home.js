import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import {
  Container,
} from 'reactstrap';
import HeaderBeforeLogin from './HeaderBeforeLogin'

// home
class Home extends Component {

  // render view
  render() {

    return(
      <Container className='home' style={{textAlign: 'center'}}>

        {/* header */}
        <HeaderBeforeLogin />

      </Container>
    )
  }
}

export default withRouter( connect()(Home) )
