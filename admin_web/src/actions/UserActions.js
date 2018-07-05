import {
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  SET_WALLET,
  SET_WEB3,
  SET_PASSWORD,
} from './Types'

export function loginSuccess ({ params }) {

  return {
    type: LOGIN_SUCCESS,
    params
  }
}

export function loginFailed () {

  return {
    type: LOGIN_FAILED
  }
}

export function setWallet ({ params }) {

  return {
    type: SET_WALLET,
    params
  }
}

export function setWeb3 ({ params }) {

  return {
    type: SET_WEB3,
    params
  }
}

export function setPassword ({ params }) {

  return {
    type: SET_PASSWORD,
    params
  }
}
