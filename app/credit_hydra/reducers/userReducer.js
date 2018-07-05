import {
  SET_KEYSTORE,
  SET_WEB3,
  SET_PASSWORD,
  SET_PROFILE,
  SET_HNT_BALANCE,
  SET_USER_STATUS,
  SET_READY,
  SET_JUST_REQUESTED,
} from '../actions/types'

function user (state = {}, action) {

  const { params } = action

  switch (action.type) {


    case SET_KEYSTORE :

      return {
        ...state,
        wallet: params.wallet,
      }

    case SET_WEB3 :

      return {
        ...state,
        web3: params.web3,
      }

    case SET_PASSWORD :

      return {
        ...state,
        account_password: params.account_password,
      }

    case SET_PROFILE :

      return {
        ...state,
        profile: params.profile,
      }

    case SET_HNT_BALANCE :

      return {
        ...state,
        hnt_balance: params.hnt_balance,
      }

    case SET_USER_STATUS :

      return {
        ...state,
        userStatus: params.userStatus,
      }

      case SET_READY :

        return {
          ...state,
          ready: true,
        }


      case SET_JUST_REQUESTED :

        return {
          ...state,
          just_requested: true,
        }



    default :
      return state
  }
}

export default user
