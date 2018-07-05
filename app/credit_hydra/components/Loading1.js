import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { LinesLoader } from 'react-native-indicator';

// loading screen
export default class Loading1 extends Component {

  state = {
    spinValue: new Animated.Value(0),
  }

  cycleAnimation = () => {

    const { spinValue } = this.state

    Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
      }),
    ]).start(event => {
      if (event.finished) {
        this.setState({spinValue: new Animated.Value(0)})
        this.cycleAnimation();
      }
    });
  }

  render() {

    const { spinValue } = this.state

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })

    return (

      <View style={{
        flexDirection:'row',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>

        <View style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>

          <LinesLoader color='green'/>

          <Text style={{fontSize: 24, marginTop: 5,}}>loading...</Text>

        </View>

      </View>
    )
  }
}
