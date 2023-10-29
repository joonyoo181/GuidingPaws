import React, { useState, useEffect } from "react";
import { View, Text, Animated } from "react-native"; // Import Animated
import LottieView from "lottie-react-native";

export default function Splash({ setIsLoading }) {
  return (
    <View
      style={{ flex: 1, alignItems: 'center', margin: 0}}>
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
