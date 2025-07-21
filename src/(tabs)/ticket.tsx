import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { RNCamera, BarCodeReadEvent } from 'react-native-camera';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import { useNavigation } from '@react-navigation/native';

export default function LiveCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const navigator = useNavigation();
  const cameraRef = useRef<RNCamera>(null);

  useEffect(() => {
    (async () => {
      try {
        // No react-native-camera, a permissão deve ser solicitada separadamente
        // Usar react-native-permissions ou pedir a permissão manualmente no Info.plist/AndroidManifest.xml
        // Aqui só definimos true assumindo que a permissão já foi concedida ou via configuração nativa
        setHasPermission(true);
      } catch {
        setHasPermission(false);
      }
    })();
  }, []);

  const handleBarCodeScanned = (event: BarCodeReadEvent) => {
    if (!scanned) {
      setScanned(true);
      navigator.navigate('ticketForm', { barcode: event.data });
      console.log(`Bar code with type ${event.type} and data ${event.data} has been scanned!`);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text style={styles.noPermissionText}>Sem acesso à câmera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          onBarCodeRead={handleBarCodeScanned}
          barCodeTypes={[
            RNCamera.Constants.BarCodeType.code128,
            RNCamera.Constants.BarCodeType.ean13,
            RNCamera.Constants.BarCodeType.ean8,
            RNCamera.Constants.BarCodeType.upc_a,
            RNCamera.Constants.BarCodeType.upc_e,
            RNCamera.Constants.BarCodeType.code39,
            RNCamera.Constants.BarCodeType.code93,
            RNCamera.Constants.BarCodeType.itf14,
            RNCamera.Constants.BarCodeType.qr,
          ]}
          captureAudio={false}
        >
          <View style={styles.overlayTop}>
            <Header title="Validar Ticket" bigTitle transparent />
            <Text style={styles.instructionText}>
              Posicione o código de barras na área demarcada para validar seu ticket.
            </Text>
          </View>

          <View style={styles.centerRow}>
            <View style={styles.overlaySide} />
            <View style={styles.barcodeArea}>
              <View style={styles.barcodeLine} />
            </View>
            <View style={styles.overlaySide} />
          </View>

          <View style={styles.overlayBottom} />
        </RNCamera>

        {scanned && (
          <TouchableOpacity style={styles.buttonScanAgain} onPress={() => setScanned(false)}>
            <Text style={{ color: '#fff' }}>Escanear novamente</Text>
          </TouchableOpacity>
        )}
      </View>

      <FooterTabBar activeTab="ticket" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraWrapper: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  overlayTop: { flex: 2, backgroundColor: 'rgba(0,0,0,0.6)' },
  instructionText: {
    color: '#fff',
    textAlign: 'left',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  centerRow: { flexDirection: 'row', alignItems: 'center', height: 120 },
  overlaySide: { flex: 1, height: '100%', backgroundColor: 'rgba(0,0,0,0.6)' },
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
  overlayBottom: { flex: 2, backgroundColor: 'rgba(0,0,0,0.6)' },
  buttonScanAgain: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 8,
    opacity: 0.85,
  },
  noPermissionText: { flex: 1, textAlign: 'center', marginTop: 20, color: '#fff' },
});
