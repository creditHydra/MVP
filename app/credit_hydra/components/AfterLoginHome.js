import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Image,
  Linking,
} from 'react-native'
import { connect } from 'react-redux'
import { hydraPink, white } from '../utils/colors'
import Icon from 'react-native-fa-icons';
import { testtest } from '../utils/WalletHelpers'

// default screen after login
class AfterLoginHome extends Component {

  // go to "my information" screen
  _gotoMyInformation = () => {
    const { navigation } = this.props
    navigation.navigate(
      'MyInformation',
    )
  }
  
  _gotoFAQ = () => {
    const url = "https://credithydra.com/blog/faqs/"
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  }

  // go to "upload file" screen
  _gotoUploadFile = () => {
    const { navigation } = this.props
    navigation.navigate(
      'UploadFileView',
    )
  }

  render() {

    let { profile, hnt_balance, userStatus, just_requested } = this.props

    // const { profile, userStatus } = this.props
    // const { userStatus } = this.state

    let showReqestButton = true
    if (userStatus === 2 || userStatus === 3) {
      showReqestButton = false
    }
    if (just_requested === true && userStatus === 1) {
      showReqestButton = false;
      userStatus = 2
    }
    let statusText = ""
    if ( userStatus === 1 ) {
      statusText = "Created"
    } else if ( userStatus === 2 ) {
      statusText = "Validation requested"
    } else if ( userStatus === 3 ) {
      statusText = "Validated"
    } else if ( userStatus === 4 ) {
      statusText = "Validation rejected"
    }
    
    return (

      <View style={[styles.container, {
          // backgroundColor: '#f0f0f0',
        }]}>

        {Platform.OS === 'ios' ? (
          <Image style={{
              padding:0,
              position: 'absolute',
              marginLeft: 0,
              marginTop: 0,
              flex: 1,
              resizeMode: 'contain',
            }} source={require('../images/Rectangle.png')} />
        ) : (
          <Image style={{
              padding:0,
              width: undefined,
              height: undefined,
              position: 'absolute',
              marginLeft: 0,
              marginTop: 0,
              flex: 1,
              resizeMode: 'contain',
            }} source={require('../images/Rectangle.png')} />
        )}


        <View style={{
            flex:1,
            justifyContent: 'flex-start'
          }}>

          <View style={{
              // flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 0,
            }}>

            <TouchableOpacity onPress={this._gotoFAQ}>
            
              <Icon name='info' style={{
                  fontSize: 36,
                  color: '#999999',
                  marginTop: 2,
                  marginRight: 10,
                }} />
            
              {/*<Image style={{
                width: 20,
                height: 15,
              }} source={require('../images/icon-menu.png')} />*/}
              
              
            </TouchableOpacity>

          </View>

          <View style={{
              // flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 0,
            }}>
            {profile.imageBase64 ? (
              <Image style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 4,
                borderColor: '#cccccc',
              }} source={{uri: `data:image/png;base64,${profile.imageBase64}`}} />
            ) : (
              <Image style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                // backgroundColor: '#cccccc',
              }} source={require('../images/default_profile.jpg')} />
            )}
            

          </View>

          <View style={{
              // flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 32,
              backgroundColor: '#ffffff',
              padding: 8,
              borderRadius:4,
              borderColor: '#cccccc',
              borderWidth: 1,
            }}>
              <Text style={{
                fontFamily: 'AvenirNext-DemiBold',
                fontSize: 24,
                }}>{hnt_balance} HNT</Text>
          </View>
          
          {userStatus !== 1 && (
            <View style={{
                flexDirection: 'row',
                marginTop: 30,
                justifyContent: 'center',
                padding: 8,
              }}>
                <Text style={{
                  fontSize: 24,
                  color: userStatus === 3 ? 'green' : '#777777'
                }}>
                  {statusText}
                </Text>
            </View>
          )}

          {/* upload files */}
          
          {showReqestButton === true && (
            <View style={{
                flexDirection: 'row',
                marginTop: 50,
              }}>
                <TouchableOpacity
                  style={Platform.OS === 'ios' ? styles.iosSubmitLoginBtn : styles.AndroidSubmitLoginBtn}
                  onPress={this._gotoUploadFile}>
                    <Text style={styles.submitBtnText}>Verify your account</Text>
                    <Icon name='arrow-right' style={{
                        fontSize: 20,
                        color: 'white',
                        justifyContent: 'flex-end',
                        marginTop: 2,
                      }} />
                </TouchableOpacity>
            </View>
          )}


          {/* my information */}
          <View style={{
              flexDirection: 'row',
              marginTop: 20,
              // borderBottomColor: '#cccccc',
              // borderBottomWidth: 1,
              // borderStyle: 'solid',
            }}>

              <TouchableOpacity
                style={{
                  flex:1,
                  flexDirection: 'row',
                  // backgroundColor: 'red',
                }}
                onPress={this._gotoMyInformation}>

                <Icon name='info-circle' style={{
                    fontSize: 20,
                    color: '#777777',
                    marginTop:10,
                    marginRight: 10,
                  }} />

                <Text style={{
                    fontSize: 20,
                    marginTop: 8,
                    color: '#777777',
                    marginBottom: 10,
                  }}>My Information</Text>

              </TouchableOpacity>
          </View>

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
    flexDirection: 'row',
    backgroundColor: hydraPink,
    padding: 10,
    borderRadius: 7,
    height: 45,
    width: '100%',
    justifyContent: 'space-between',
  },
  AndroidSubmitLoginBtn: {
    flexDirection: 'row',
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
    justifyContent: 'space-between',
  },
  submitBtnText: {
    color: white,
    fontSize: 20,
    textAlign: 'left',
  },
})

function mapStateToProps ({ user }) {

  if (user){
    return {
      wallet: user.wallet,
      web3: user.web3,
      account_password: user.account_password,
      profile: user.profile,
      hnt_balance: user.hnt_balance,
      userStatus: user.userStatus,
      just_requested: user.just_requested,
    }
  } else {
    return {}
  }
}

// function mapDispatchToProps (dispatch) {
//   return {
//     setKeystore: (data) => dispatch(setKeystore({ params: data})),
//     setWeb3: (data) => dispatch(setWeb3({ params: data})),
//     setPassword: (data) => dispatch(setPassword({ params: data})),
//   }
// }

export default connect(
  mapStateToProps, null
)(AfterLoginHome)
