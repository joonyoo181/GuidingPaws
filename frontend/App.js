import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Button
} from 'react-native';
import { Camera } from 'react-native-vision-camera';

function App() {
  const camera = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const devices = Camera.getAvailableCameraDevices();
  const device = devices.find((d) => d.position === 'back');

  const takePhoto = async () => {
    const photo = await camera.current.takePhoto({
      qualityPrioritization: 'speed',
      flash: 'auto',
      enableShutterSound: false
    })
    console.log(photo);
  }

  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
      console.log(newCameraPermission);
    }
    getPermission();
  }, []);

  setInterval(() => {
    if (isCameraReady) {
      takePhoto();
    }
  }, 5000)

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