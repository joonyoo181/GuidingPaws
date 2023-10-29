import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import Tts from 'react-native-tts';
import RNFS from 'react-native-fs';

function App() {
  const camera = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const devices = Camera.getAvailableCameraDevices();
  const device = devices.find((d) => d.position === 'back');
  const lastSpeech = useRef(null);

  const encodeImageToBase64 = async (imagePath) => {
    try {
      const base64String = await RNFS.readFile(imagePath, 'base64');
      return base64String;
    } catch (error) {
      throw new Error("Error while encoding image to base64: " + error.message);
    }
  };

  const sendImageToAPI = async (base64String) => {
    try {
      const url = 'http://10.0.0.235:4000/image';
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: base64String,
      });
  
      if (response.ok) {
        const responseData = await response.json();
        //console.log('API Response:', responseData);
        //console.log(responseData.direction)
        if (responseData.direction != null && responseData.label) {
          speak("there is a " + responseData.label + "on the" + responseData.direction)
        }
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending the image to the API:', error);
    }
  };

  const takePhoto = async () => {
    const photo = await camera.current.takePhoto({
      qualityPrioritization: 'speed',
      quality: 5,
      flash: 'on',
      enableShutterSound: false
    })
    await encodeImageToBase64(photo.path)
      .then((base64String) => {
        //console.log("Based 64 encoded:", base64String);
        sendImageToAPI(base64String);
      })
      .catch((error) => {
        console.error(error);
      });
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
      await delay(5000);
      const newCameraPermission = await Camera.requestCameraPermission();
      console.log(newCameraPermission);
    }
    getPermission();

    // TTS config
    Tts.setDefaultLanguage('en-US');

    // Optionally, adjust the speed and pitch
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(0.9);
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

  return (
    <>
      {device == null ? (
        <Text>Camera not available</Text>
      ) : (
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
      )}
    </>
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