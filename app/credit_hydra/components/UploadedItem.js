import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import Icon from 'react-native-fa-icons';

// item for each uploaded image
class UploadedItem extends Component {

  // check uploaded image
  _seeDocument = () => {
    const { item } = this.props
    this.props.seeDocument(item)
  }

  // request validation
  _requestValidation = () => {
    const { item } = this.props
    this.props.requestValidation(item)
  }

  render() {

    const { item } = this.props

    return (

      <View style={[styles.container, {
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1,
        borderStyle: 'solid',
      }]}>


        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}>
          <Text style={{
            color: '#777777',
            fontSize: 12,
          }}>Uploaded: {item.uploaded}</Text>
        </View>

        <View style={{
          flexDirection: 'row',
        }}>
          <Text style={{
            color: hydraPink,
            fontSize: 12,
          }}>Document Hash</Text>
        </View>

        <View style={{
          flexDirection: 'row',
        }}>
          <Text style={{
            color: '#777777',
            fontSize: 12,
          }}>{item.ipfsHash}</Text>
        </View>

        <View style={{
          marginTop: 6,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>

          <TouchableOpacity onPress={this._seeDocument} style={{
            flexDirection: 'row',
          }}>
            <Icon name='eye' style={{
                fontSize: 20,
                color: 'green',
                justifyContent: 'flex-end',
                marginTop: 2,
              }} />
              <Text style={{
                fontSize: 12,
                marginTop: 6,
                marginLeft: 4,
              }}>
                Check
              </Text>
          </TouchableOpacity>

          {item.status === 0 && (
            <TouchableOpacity onPress={this._requestValidation} style={{
              flexDirection: 'row',
              backgroundColor: hydraPink,
              paddingTop: 2,
              paddingBottom: 8,
              paddingLeft: 6,
              paddingRight: 10,
              borderRadius: 6,
            }}>
              <Icon name='check' style={{
                fontSize: 20,
                color: '#ffffff',
                justifyContent: 'flex-end',
                marginTop: 2,
              }} />
              <Text style={{
                fontSize: 12,
                marginTop: 6,
                marginLeft: 4,
                color: '#ffffff',
              }}>
                Validate document
              </Text>
            </TouchableOpacity>
          )}

          {item.status === 1 && (
            <View style={{
              flexDirection: 'row',
              // backgroundColor: hydraPink,
              paddingTop: 2,
              paddingBottom: 8,
              paddingLeft: 6,
              paddingRight: 10,
              // borderRadius: 6,
            }}>
              <Icon name='check' style={{
                fontSize: 20,
                color: hydraPink,
                justifyContent: 'flex-end',
                marginTop: 2,
              }} />
              <Text style={{
                fontSize: 12,
                marginTop: 6,
                marginLeft: 4,
                color: hydraPink,
              }}>
                Requested
              </Text>
            </View>
          )}

          {item.status === 2 && (
            <View style={{
              flexDirection: 'row',
              // backgroundColor: hydraPink,
              paddingTop: 2,
              paddingBottom: 8,
              paddingLeft: 6,
              paddingRight: 10,
              // borderRadius: 6,
            }}>
              <Icon name='check' style={{
                fontSize: 20,
                color: 'green',
                justifyContent: 'flex-end',
                marginTop: 2,
              }} />
              <Text style={{
                fontSize: 12,
                marginTop: 6,
                marginLeft: 4,
                color: 'green',
              }}>
                Validated
              </Text>
            </View>
          )}

        </View>

      </View>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: white
  },
  iosSubmitLoginBtn: {
    backgroundColor: hydraPink,
    padding: 10,
    borderRadius: 7,
    height: 45,
    width: '100%',
    marginLeft: 40,
    marginRight: 40,
    marginTop:5,
    marginBottom:25,
  },
  AndroidSubmitLoginBtn: {
    backgroundColor: hydraPink,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    height: 45,
    width: '100%',
    borderRadius: 2,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: 'center',
  },
})

// function mapStateToProps ({ user }) {
//
//   if (user){
//     return {
//       wallet: user.wallet,
//       web3: user.web3,
//       account_password: user.account_password,
//       profile: user.profile,
//     }
//   } else {
//     return {}
//   }
// }

// function mapDispatchToProps (dispatch) {
//   return {
//     setKeystore: (data) => dispatch(setKeystore({ params: data})),
//     setWeb3: (data) => dispatch(setWeb3({ params: data})),
//     setPassword: (data) => dispatch(setPassword({ params: data})),
//   }
// }

export default connect(
  null, null
)(UploadedItem)
