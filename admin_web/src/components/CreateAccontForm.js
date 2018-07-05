import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Input,
 } from 'reactstrap';
import * as MyAPI from '../utils/MyAPI'
import { LOCAL_STRAGE_USER_KEY } from '../utils/Settings'
import Alert from 'react-s-alert';
import * as UserActions from '../actions/UserActions'
// import * as WalletHelpers from '../utils/WalletHelpers'

// form to create a new account
class CreateAccontForm extends Component {

  state = {
    email: '',
    password: '',
    loading: false,
  }

  // create account
  onSubmit = () => {

    const { email, password } = this.state

    if (!email || !password) {
      Alert.error("Invalid email id or password", {
        position: 'top-right',
        effect: 'slide',
        timeout: 5000
      });
      return;
    }

    const white_list = [
      "kouohhashi@gmail.com",
      "abhishek@credithydra.com",
    ]

    if (white_list.indexOf(email) === -1) {
      Alert.error("Invalid email id", {
        position: 'top-right',
        effect: 'slide',
        timeout: 5000
      });
      return;
    }

    this.setState({
      loading: true,
    })

    // let userId = null;

    // let web3_2 = null
    // let wallet_2 = null
    // let seed_text_2 = null

    // create account
    Promise.resolve()
    .then(() => {
      // create an account on server

      const params = {
        email: email,
        password: password,
      }
      return MyAPI.createAccount(params)
    })
    .then((results) => {
      // check results

      if (!results) {
        return Promise.reject(Error("server error"))
      }

      if (results.status === 'error') {
        return Promise.reject(Error(results.message))
      }

      // success

      const userId = results.user._id
      if (!userId){
        return Promise.reject(Error("invalid user id"))
      }

      const params = {
        user: results.user,
        login_token: results.login_token,
      }

      // save token and profile
      localStorage.setItem(LOCAL_STRAGE_USER_KEY, JSON.stringify(params))
      // update props
      this.props.loginSuccess(params)
    })
    .then(() => {
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

  // handle input
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
                color="success"
                style={{width: '100%'}}
                onClick={this.onSubmit}
                >
                Create an account
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
    loginSuccess: (data) => dispatch(UserActions.loginSuccess({ params: data})),
    // walletPrepared: (data) => dispatch(walletPrepared({ params: data})),
  }
}

// export default withRouter(MainPage);
export default withRouter( connect( null, mapDispatchToProps )(CreateAccontForm) )
