import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Linking,
} from 'react-native';
import { BottomSheet } from '../BottomSheet';
import { ThemedText } from '../ThemedText';
import { Animated as RNAnimated } from 'react-native';

export interface BannerItem {
  id: string;
  image: string;
  onPress?: () => void;
  createdTime: string;
  lastEditedTime: string;
  createdBy: string;
  lastEditedBy: string;
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  periodStart?: string;
  periodEnd?: string;
}

interface BannerComponentProps {
  banners: BannerItem[];
  onLoad?: () => void;
}

const BannerComponent: React.FC<BannerComponentProps> = ({ banners, onLoad }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [imageHeights, setImageHeights] = useState<{ [key: string]: number }>({});
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastBannerImages, setLastBannerImages] = useState<string[]>([]);
  const [imageOpacities, setImageOpacities] = useState<{ [key: string]: RNAnimated.Value }>({});

  // Pré-carrega todas as imagens quando o componente monta ou quando as imagens mudam
  useEffect(() => {
    const currentImages = banners.map(banner => banner.image);
    // Verifica se as imagens mudaram
    const imagesChanged =
      currentImages.length !== lastBannerImages.length ||
      currentImages.some((img, idx) => img !== lastBannerImages[idx]);

    if (banners.length === 0) {
      // Se não há banners, chama onLoad imediatamente
      onLoad?.();
      return;
    }
    if (!imagesChanged) {
      return;
    }

    const prefetchImages = async () => {
      try {
        await Promise.all(
          banners.map(banner => (banner.image ? Image.prefetch(banner.image) : Promise.resolve()))
        );
      } catch (error) {
        console.error('Error prefetching images:', error);
      } finally {
        setInitialLoad(false);
        setLastBannerImages(currentImages);
        setLoadedImages(new Set()); // Limpa o set para garantir que o onLoad só dispare após todas as novas imagens carregarem
      }
    };

    prefetchImages();
  }, [banners]);

  useEffect(() => {
    if (!initialLoad && banners.length > 0 && loadedImages.size === banners.length) {
      onLoad?.();
    }
  }, [initialLoad, loadedImages.size, banners.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, banners.length]);

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  useEffect(() => {
    // Inicializa opacidades para cada banner
    const newOpacities: { [key: string]: RNAnimated.Value } = {};
    banners.forEach(banner => {
      newOpacities[banner.id] = new RNAnimated.Value(0);
    });
    setImageOpacities(newOpacities);
  }, [banners]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / containerWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current && containerWidth > 0) {
      scrollViewRef.current.scrollTo({
        x: index * (containerWidth + 10), // Adiciona o gap de 10 que você definiu no contentContainerStyle
        animated: true,
      });
    }
  };

  const onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width * 0.9);
  };

  const handleImageLoad = (event: any, bannerId: string) => {
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = width / height;
    const calculatedHeight = containerWidth / aspectRatio;

    setImageHeights((prevHeights) => ({
      ...prevHeights,
      [bannerId]: calculatedHeight,
    }));

    // Inicia fadeIn e só adiciona ao loadedImages após animação
    if (imageOpacities[bannerId]) {
      RNAnimated.timing(imageOpacities[bannerId], {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setLoadedImages((prev) => {
          const newSet = new Set(prev);
          newSet.add(bannerId);
          return newSet;
        });
      });
    } else {
      setLoadedImages((prev) => {
        const newSet = new Set(prev);
        newSet.add(bannerId);
        return newSet;
      });
    }
  };

  const activeBackground = useThemeColor({}, 'activeBackground');
  const brand = useThemeColor({}, 'brand');
  const background1 = useThemeColor({}, 'background1');
  const text2 = useThemeColor({}, 'text2');

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      position: 'relative',
    },
    bannerWrapper: {
      height: 240,
      width: '100%',
      overflow: 'hidden',
    },
    bannerImage: {
      width: '100%',
      borderRadius: 15,
      overflow: 'hidden',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -10,
      marginBottom: 20,
    },
    dot: {
      width: 30,
      height: 4,
      borderRadius: 2,
      backgroundColor: background1,
      marginHorizontal: 5,
    },
    activeDotContainer: {
      width: 30,
      height: 4,
      borderRadius: 2,
      backgroundColor: background1,
      marginHorizontal: 5,
      overflow: 'hidden',
    },
    activeDotFill: {
      height: '100%',
      backgroundColor: text2,
      borderRadius: 2,
    },
    backgroundTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: brand,
      zIndex: -1,
    },
    bottomSheetContent: {
      padding: 20,
      minHeight: 200, // Altura mínima para evitar colapso
      maxHeight: Dimensions.get('window').height * 0.7, // Limite máximo baseado na tela
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />

      <View style={styles.bannerWrapper} onLayout={onLayout}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          centerContent
          snapToAlignment="center"
          onScroll={handleScroll}
          scrollEventThrottle={300}
          contentContainerStyle={{ paddingHorizontal: containerWidth * 0.05, gap: 10 }}
        >
          {banners.map((banner) => (
            <TouchableOpacity
              key={banner?.id}
              onPress={() => setSelectedBanner(banner)}
              activeOpacity={0.8}
              style={{ width: containerWidth, alignContent: 'center', justifyContent: 'center' }}
            >
              <RNAnimated.Image
                source={{ uri: banner?.image }}
                style={[
                  styles.bannerImage,
                  { height: imageHeights[banner?.id] || 204, opacity: imageOpacities[banner?.id] || 0 },
                ]}
                resizeMode="contain"
                onLoad={(event) => handleImageLoad(event, banner?.id)}
                onError={() => {
                  setLoadedImages((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(banner?.id);
                    return newSet;
                  });
                }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToIndex(index)}
            style={currentIndex === index ? styles.activeDotContainer : styles.dot}
          >
            {currentIndex === index && (
              <Animated.View
                style={[
                  styles.activeDotFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <BottomSheet
        visible={!!selectedBanner}
        onClose={() => setSelectedBanner(null)}
        onPrimaryPress={() => {
          if (selectedBanner?.link) {
            Linking.openURL(selectedBanner.link);
          }
        }}
        primaryButtonLabel="Saiba mais"
        secondaryButtonLabel="Fechar"
      >
        {selectedBanner && (
          <ScrollView
            style={styles.bottomSheetContent}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
              {selectedBanner.title}
            </ThemedText>
            <ThemedText style={{ fontSize: 16, lineHeight: 24 }}>
              {selectedBanner.description}
            </ThemedText>
          </ScrollView>
        )}
      </BottomSheet>
    </View>
  );
};

export default BannerComponent;