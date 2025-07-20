import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import { useNavigation } from '@react-navigation/native';

export default function LiveCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const navigator = useNavigation();

  // Solicita permissão para acessar a câmera
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = (result: { type: string; data: string }) => {
    setScanned(true);
    navigator.navigate('ticketForm', { barcode: result.data });
    console.log(`Bar code with type ${result.type} and data ${result.data} has been scanned!`);
  };

  // Se a permissão não foi concedida
  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["code128", "ean13", "ean8", "upc_a", "upc_e", "code39", "code93", "itf14", "qr"] }}
        >
          <View style={styles.overlayTop} >
            <Header title='Validar Ticket' bigTitle transparent />
            <Text style={{ color: '#fff', textAlign: 'left', marginVertical: 10, marginHorizontal: 20, }}>
              Posicione o código de barras na área demarcada para validar seu ticket.
            </Text>

          </View>
          {/* Overlays */}

          <View style={styles.centerRow}>
            <View style={styles.overlaySide} />
            <View style={styles.barcodeArea}>
              <View style={styles.barcodeLine} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </CameraView>
        {scanned && (
          <TouchableOpacity style={styles.buttonScanAgain} onPress={() => setScanned(false)}>
            <Text style={{ color: '#fff' }}>Escanear novamente</Text>
          </TouchableOpacity>
        )}
      </View>
      <FooterTabBar activeTab='ticket' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlayTop: {
    flex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 120,
  },
  overlaySide: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  barcodeArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  barcodeLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#37A0FC',
    borderRadius: 1,
  },
  overlayBottom: {
    flex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  buttonScanAgain: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 8,
    opacity: 0.85,
  },
});