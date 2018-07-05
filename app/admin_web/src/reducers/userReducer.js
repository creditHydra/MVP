import {
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  SET_WALLET,
  SET_WEB3,
  SET_PASSWORD,
} from '../actions/Types'

function user (state = {}, action) {

  switch (action.type) {

    case LOGIN_SUCCESS :

      const { login_token, user } = action.params
      return {
        ...state,
        _id: user._id,
        profile: user.profile,
        login_token: login_token,
        ready: true,
      }

    case LOGIN_FAILED :

      return {
        ...state,
        ready: true,
      }


    case SET_WALLET :

      const { wallet } = action.params
      return {
        ...state,
        wallet: wallet,
      }

    case SET_WEB3 :

      const { web3 } = action.params
      return {
        ...state,
        web3: web3,
      }

    case SET_PASSWORD :

      const { account_password } = action.params
      return {
        ...state,
        account_password: account_password,
      }

    default :
      return state
  }
}

export default user
