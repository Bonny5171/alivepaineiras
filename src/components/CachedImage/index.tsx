import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, ImageStyle } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as Crypto from 'expo-crypto';

type Props = {
  source: { uri: string };
  style?: ImageStyle | ImageStyle[];
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  onLoad?: (event: { source: { width: number; height: number } }) => void;
  onError?: () => void;
};

const CachedImage: React.FC<Props> = ({
  source,
  style,
  resizeMode = 'contain',
  onLoad,
  onError,
}) => {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!source?.uri) return;

    const loadImage = async () => {
      try {
        const fileName = await generateFileName(source.uri);
        const filePath = `${FileSystem.cacheDirectory}${fileName}`;

        const metadata = await FileSystem.getInfoAsync(filePath);
        if (metadata.exists) {
          console.log('ARQUIVO JA EXISTE!!!')
          setUri(filePath);
        } else {
          console.log('DOWNLOAD DE NOVA IMAGEM!!!')
          const downloaded = await FileSystem.downloadAsync(source.uri, filePath);
          setUri(downloaded.uri);
        }
      } catch (error) {
        console.warn('Erro ao cachear imagem:', error);
        onError?.();
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [source?.uri]);

  return (
    <View style={[styles.container, style]}>
      {loading && <ActivityIndicator style={StyleSheet.absoluteFill} />}
      {uri && (
        <Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, style]}
          contentFit={resizeMode === 'contain' ? 'contain' : 'cover'}
          onLoad={(event) => {
            if (onLoad) {
              const { width, height } = event.source;
              onLoad({ source: { width, height } });
            }
          }}
          onError={onError}
          transition={300}
        />
      )}
    </View>
  );
};

// Função segura para gerar nome de arquivo único baseado na URL
async function generateFileName(uri: string): Promise<string> {
  // Remove parâmetros da URL (tudo após o ?)
  const cleanUri = uri.split('?')[0];
  console.log('cleanUri >>', cleanUri); 
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    cleanUri
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CachedImage;
