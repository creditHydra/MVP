import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import {
  Row,
  Col,
  Button,
} from 'reactstrap';
import * as WalletHelpers from '../utils/WalletHelpers'
import * as UserActions from '../actions/UserActions'

// validation request item
class ValidationRequestItem extends Component {

  state = {
    userName: null,
  }

  componentDidMount(){
    const { item } = this.props
    WalletHelpers.decrypt_with_privateKey({ _encrypted: item.encryptedProfileName })
    .then((results) => {
      this.setState({
        userName: results
      })
    })
    .catch((err) => {
      console.log("err: ", err)
    })
  }

  _checkDetail = () => {
    const { item } = this.props
    this.props.history.push("/request_detail?item_id="+item._id)
  }


  // render view
  render() {

    const { item } = this.props
    const { userName } = this.state

    return(

      <div style={{
        marginTop: 20,
        marginBottom: 20,
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        }}>

        <Row style={{
            marginTop: 10,
            marginBottom: 10,
          }}>

          <Col md="3" xs="12">

            <span>{item._id}</span>

          </Col>

          <Col md="3" xs="12">
            <span>{userName}</span>
          </Col>

          <Col md="3" xs="12">
            <span>{item.createdAt.toString()}</span>
          </Col>

          <Col md="3" xs="12">
            <Button
              color="primary"
              style={{width: '100%'}}
              onClick={this._checkDetail}>
              Check
            </Button>
          </Col>

        </Row>
      </div>
    )
  }
}


// {docList.map((docItem) => (
//   <ValidationRequestDocItem item={docItem} key={docItem._id} />
// ))}
//
//
// {docList && docList.length > 0 && justValidatedFlg === false && (
//   <Row>
//     <Col md="6" xs="12">
//       <Button
//         color="danger"
//         onClick={() => this._validate_docs({ validationStatus: 3 })}>
//         Looks good.
//       </Button>
//     </Col>
//     <Col md="6" xs="12">
//       <Button
//         color="danger"
//         onClick={() => this._validate_docs({ validationStatus: 4 })}>
//         Meh...
//       </Button>
//     </Col>
//   </Row>
// )}
// </div>


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
    setPassword: (data) => dispatch(UserActions.setPassword({ params: data})),
  }
}

export default withRouter( connect( mapStateToProps, mapDispatchToProps )(ValidationRequestItem) )
