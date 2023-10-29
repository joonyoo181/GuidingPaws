import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native"; // Import Animated
import LottieView from "lottie-react-native";

function Splash({ setIsLoading }) {
  return (
    <View
      style={{ flex: 1, alignItems: 'center', margin: 50}}>
      <Text style={styles.titleText}>GuidingPaws</Text>
      <LottieView
        source={require('../frontend/assets/animation_lob95ys3.json')}
        autoPlay
        loop={false}
        resizeMode='center'
        speed={0.8}
        onAnimationFinish={() => setIsLoading(false)}
      />
      <LottieView
        source={require('../frontend/assets/animation_lob7wkgo.json')}
        autoPlay
        loop={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: 45,
    fontWeight: 'bold',
    marginStart: '500px',
    color: '#9AACF8'
  },
});

export default Splash;