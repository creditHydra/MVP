import { API_URL, API_KEY } from './Settings'

const headers = {
  'Accept': 'application/json',
  'Authorization': API_KEY
}

// create an account
export const createAccount = (params) =>
  fetch(`${API_URL}/api/create_user`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

// signin
export const signinWithPassword = (params) =>
  fetch(`${API_URL}/api/login_with_email_password`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

// signin with token
export const signinWithToken = (params) =>
  fetch(`${API_URL}/api/login_with_token`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


// logout
export const logout = (params) =>
  fetch(`${API_URL}/api/logout`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


//
// credit hydra specific
//

// get validation requests
export const getValidationRequests = (params) =>
  fetch(`${API_URL}/api/admin_get_validation_requests`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


// get validation requests
export const markAsValidated = (params) =>
  fetch(`${API_URL}/api/admin_mark_as_validated`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())


// get detail of 1 validation requests
export const getValidationRequestDetail = (params) =>
  fetch(`${API_URL}/api/admin_get_varidation_request_detail`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())

//
export const RequestTemporaryPubkey = (params) =>
  fetch(`${API_URL}/api/admin_request_temporary_pubkey`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( params )
  }).then(res => res.json())
