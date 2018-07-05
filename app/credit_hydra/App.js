/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

// need these a couple lines ...
import './shim.js'
import crypto from 'crypto'
import ethUtil from 'ethereumjs-util'
import lightwallet from 'eth-lightwallet'
// console.log(crypto.randomBytes(32).toString('hex'))

import React, { Component } from 'react';
import {
  View
} from 'react-native';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducer from './reducers'
import Home from './components/Home'

export default class App extends React.Component {

  render() {
    return (
      <Provider store={createStore(reducer)}>
        <View style={{
            flex: 1,
          }}>
          <Home />
        </View>
      </Provider>
    );
  }
}
