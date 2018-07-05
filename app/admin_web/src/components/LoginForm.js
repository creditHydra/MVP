import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import {
  Container,
  Row,
  Col,
  Button,
  Input,
  Form,
  FormGroup,
} from 'reactstrap';
import Alert from 'react-s-alert';
import * as MyAPI from '../utils/MyAPI'
import { LOCAL_STRAGE_USER_KEY } from '../utils/Settings'
import { loginSuccess } from '../actions/UserActions'

// sign in form
class LoginForm extends Component {

  state = {
    email: '',
    password: '',
    loading: false,
  }

  onSubmit = (e) => {

    this.setState({
      loading: true,
    })

    const { email, password } = this.state

    if (!email || !password) {
      Alert.error("Invalid email or password", {
        position: 'top-right',
        effect: 'slide',
        timeout: 5000
      });
      return;
    }

    const params = {
      email: email,
      password: password,
    }

    // create account
    MyAPI.signinWithPassword(params)
    .then((results) => {

      if (!results) {
        return Promise.reject(Error("server error"))
      }

      if (results.status !== 'success') {
        return Promise.reject(Error(results.message))
      }

      // success
      const params = {
        user: results.user,
        login_token: results.login_token,
      }

      // save user
      localStorage.setItem(LOCAL_STRAGE_USER_KEY, JSON.stringify(params))

      // update props
      this.props.loginSuccess(params)

    })
    .then(() => {

      this.setState({
        loading: false,
      })

      // redirect
      this.props.history.push("/dashboard")
    })
    .catch((err) => {
      console.log("err:", err)

      this.setState({
        loading: false,
      })

      Alert.error(err.message, {
        position: 'top-right',
        effect: 'slide',
        timeout: 5000
      });
    })
  }

  // handle inputs
  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  // render view
  render() {

    const { email, password } = this.state

    return(
      <Container className='create_acount_form'>

        <Form style={{marginTop:60}}>

          <Row>
            <Col md="3" xs="12" />
            <Col md="6" xs="12" style={{textAlign: 'left'}}>
              <FormGroup>
                <label>
                  Email
                </label>
                <Input
                  style={{width: '100%'}}
                  name='email'
                  onChange={this.handleChange}
                  value={email}
                  placeholder='yourname@example.com' />
              </FormGroup>
            </Col>
            <Col md="3" xs="12" />
          </Row>

          <Row>
            <Col md="3" xs="12" />
            <Col md="6" xs="12" style={{textAlign: 'left'}}>
              <FormGroup>
                <label>Password</label>
                <Input
                  style={{width: '100%'}}
                  name='password'
                  onChange={this.handleChange}
                  value={password}
                  placeholder='********' />
              </FormGroup>
            </Col>
            <Col md="3" xs="12" />
          </Row>

          <Row>
            <Col md="3" xs="12" />
            <Col md="6" xs="12">
              <Button
                onClick={this.onSubmit}
                color="primary"
                style={{width: '100%'}}
                >
                Login
              </Button>
            </Col>
            <Col md="3" xs="12" />
          </Row>

        </Form>

      </Container>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    loginSuccess: (data) => dispatch(loginSuccess({ params: data})),
  }
}


// export default withRouter(MainPage);
export default withRouter( connect( null, mapDispatchToProps )(LoginForm) )
