import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Animation from 'lottie-react-native';
import LogoAnimation from '@/assets/animations/logo_bg_pink.json';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function AnimatedSplashScreen({ children }) {
  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    if (isAppReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setSplashFinished(true));
    }
  }, [isAppReady]);

  const onReady = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simula carregamento real
    } finally {
      setAppReady(true);
    }
  }, []);

  useEffect(() => {
    onReady();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashFinished && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: animation,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#DA1984',
            },
          ]}
        >
            <Animation
              source={LogoAnimation}
              autoPlay
              loop
              style={{
                width: 200,
                height: 200,
              }}
            />
        </Animated.View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'black',
    fontSize: 30,
    marginBottom: 15,
    fontWeight: 'bold',
  },
});
