import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Button
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import Tts from 'react-native-tts';

function App() {
  const camera = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const devices = Camera.getAvailableCameraDevices();
  const device = devices.find((d) => d.position === 'back');
  const lastSpeech = useRef(null);

  const takePhoto = async () => {
    const photo = await camera.current.takePhoto({
      qualityPrioritization: 'speed',
      flash: 'auto',
      enableShutterSound: false
    })
    console.log(photo);
  }

  const speak = (text) => {
    if (lastSpeech.current !== null) {
      // If there's an ongoing speech, stop it before starting a new one
      stopSpeaking();
    }
    lastSpeech.current = text;
    Tts.speak(text, { forceStop: true });
  };

  const stopSpeaking = () => {
    Tts.stop();
    lastSpeech.current = null;
  };

  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
      console.log(newCameraPermission);
    }
    getPermission();

    // TTS config
    Tts.setDefaultLanguage('en-US');

    // Optionally, adjust the speed and pitch
    Tts.setDefaultRate(0.8);
    Tts.setDefaultPitch(1);
  }, []);

  useEffect(() => {
    if (isCameraReady) {
      setInterval(() => {
        if (camera.current) {
          takePhoto();
        }
    }, 5000)
  }
  }, [isCameraReady]);

  if (device == null) {
    return <Text>Camera not available</Text>;
  } else {
    
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        onInitialized={() => setIsCameraReady(true)}
        device={device}
        photo={true}
        isActive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default App;