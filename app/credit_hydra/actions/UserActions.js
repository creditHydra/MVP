import {
  SET_KEYSTORE,
  SET_WEB3,
  SET_PASSWORD,
  SET_PROFILE,
  SET_HNT_BALANCE,
  SET_USER_STATUS,
  SET_READY,
 SET_JUST_REQUESTED,
} from './types'

export function setKeystore ( { params }) {
  return {
    type: SET_KEYSTORE,
    params
  }
}

export function setWeb3 ( { params }) {
  return {
    type: SET_WEB3,
    params
  }
}

export function setPassword ( { params }) {
  return {
    type: SET_PASSWORD,
    params
  }
}

export function setProfile ( { params }) {
  return {
    type: SET_PROFILE,
    params
  }
}

export function setHNTBalance ( { params }) {
  return {
    type: SET_HNT_BALANCE,
    params
  }
}

export function setUserStatus ( { params }) {
  return {
    type: SET_USER_STATUS,
    params
  }
}

export function setReady ( { params }) {
  return {
    type: SET_READY,
    params
  }
}

export function setJustRequested ( { params }) {
  return {
    type: SET_JUST_REQUESTED,
    params
  }
}
