import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import Tts from 'react-native-tts';
import RNFS from 'react-native-fs';
import Splash from './Splash';

function App() {
  const [isSplash, setIsSplash] = useState(true);
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
      const url = 'http://192.168.199.181:4000/image';
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: base64String,
      });
  
      if (response.ok) {
        const responseData = await response.json();
        console.log('API Response:', responseData);
        //console.log(responseData.direction)
        if (responseData.direction != null && responseData.label) {
          if (responseData.direction == "left") {
            speak("please move right there is a " + responseData.label + "left");
          } else if (responseData.direction == "right") {
            speak("please move left there is a " + responseData.label + "right");
          } else if (responseData.direction == "middle") {
            speak("there is a " + responseData.label + "straight ahead");
          } else if (responseData.direction == "top") {
            speak("there is a " + responseData.label + "above you, watch your head")
          } else {
            speak("there is a " + responseData.label + "below you, watch your step")
          }
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
      flash: 'auto',
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
    setTimeout(
      () => {
        async function getPermission() {
          const newCameraPermission = await Camera.requestCameraPermission();
          console.log(newCameraPermission);
        }
        getPermission();
    
        // TTS config
        Tts.setDefaultLanguage('en-US');
    
        // Optionally, adjust the speed and pitch
        Tts.setDefaultRate(0.5);
        Tts.setDefaultPitch(1.5);
      }, 5000
    )
  }, []);

  useEffect(() => {
    if (isCameraReady) {
      setInterval(() => {
        if (camera.current) {
          takePhoto();
        }
    }, 2500)
  }
  }, [isCameraReady]);

  return (
    <>
      { isSplash ?
        <Splash setIsLoading={setIsSplash}/> :
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
          <View style={styles.topBox}>
              <Text style={styles.boxText}>Your Text Here</Text>
            </View>
        </View>
      )}
      </>
      }
    </>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Background color with some transparency
    padding: 16,
    alignItems: 'center',
  },
  boxText: {
    color: 'white',
    fontSize: 18,
  },
});

export default App;