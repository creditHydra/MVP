import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  // Container,
  Row,
  Col,
  Button,
} from 'reactstrap';

class HeaderBeforeLogin extends Component {

  render() {

    const { location } = this.props

    return(
      <Row style={{
          marginTop:60,
          marginBottom: 60,
        }}>
        <Col xs="12" md="6" style={{textAlign: 'left'}}>
          <Link to="/" style={{
              color: location.pathname === '/' ? '#cccccc' : '#000000',
            }}>Home</Link>
        </Col>
        <Col style={{textAlign: 'right'}}>

          <Link to="/signin" style={{
              color: location.pathname === '/signin' ? '#cccccc' : '#000000',
              marginRight: 16,
            }}>Login</Link>

          <Link to="/create_acount">
            <Button color={location.pathname === '/create_acount' ? 'secondary' : 'primary'}>
              Create an account
            </Button>
          </Link>

        </Col>
      </Row>
    )
  }
}

export default withRouter( connect()( HeaderBeforeLogin ) )
