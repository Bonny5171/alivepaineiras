import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image, Appearance, Alert, Animated, PermissionsAndroid, Platform  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './ui/IconSymbol';
import { AssociadoResponseItem, listarDependentes } from '@/api/app/atividades';
import { uploadAvatar } from '@/api/app/associados';
import { useAuth } from '@/providers';
import { Wrapper } from './Wrapper';
import Header from '@/components/Header';
// import * as ImagePicker from 'expo-image-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import { getAuthContext } from '@/providers/AuthProvider';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useColorScheme } from '@/hooks/useColorScheme';
// import { version } from '../package.json';

type ProfileItem = {
  title: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

type ProfileProps = {
  onLogout: () => void;
};

type ProfileScreenRouteProp = RouteProp<
  { Profile: { TITULO?: string } },
  'Profile'
>;

const THEME_KEY = 'user_theme';

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const [profile, setProfile] = useState<AssociadoResponseItem | null>(null);
  const AuthContext = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const route = useRoute<ProfileScreenRouteProp>();
  const [imageCacheKey, setImageCacheKey] = useState(Date.now().toString());

  // Recebe TITULO via navigation params, se existir
  const passedTitulo = route.params?.TITULO || AuthContext.user;

  const showToastMessage = () => {
    setShowToast(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowToast(false));
    }, 3000);
  };

  // Função para recarregar os dados do perfil
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await listarDependentes({ TITULO: passedTitulo });
      const userProfile = response.find((item) => item.TITULO === passedTitulo);
      console.log(userProfile);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        console.warn('Perfil não encontrado na resposta');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Falha ao carregar os dados do perfil');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'dark');
        } else {
          setDarkMode(colorScheme === 'dark');
        }
      } catch (error) {
        console.error('Erro ao carregar o tema:', error);
      }
    };

    loadTheme();
  }, []);

  const handleSwitchChange = async (value: boolean) => {
    setDarkMode(value);
    Appearance.setColorScheme(value ? 'dark' : 'light');
    try {
      await AsyncStorage.setItem(THEME_KEY, value ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar o tema:', error);
    }
  };

  // const handleEditAvatar = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria para selecionar uma imagem.');
  //     return;
  //   }
  
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 1,
  //     base64: true,
  //   });
  
  //   if (result.canceled) {
  //     console.log('Seleção de imagem cancelada');
  //     return;
  //   }
  
  //   if (!result.assets || !result.assets[0].base64) {
  //     Alert.alert('Erro', 'Falha ao obter a imagem selecionada');
  //     return;
  //   }
  
  //   setIsLoading(true);
  //   try {
  //     const manipulatedImage = await ImageManipulator.manipulateAsync(
  //       result.assets[0].uri,
  //       [{ resize: { width: 200, height: 200 } }],
  //       { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  //     );
  
  //     if (!manipulatedImage.base64) {
  //       throw new Error('Falha ao obter base64 da imagem redimensionada');
  //     }
  
  //     const context = getAuthContext();
  //     const base64Image = manipulatedImage.base64;
  
  //     const uploadParams = {
  //       TITULO: passedTitulo,
  //       CHAVE: context.chave,
  //       AVATAR: base64Image,
  //     };
  
  //     console.log('Enviando upload com parâmetros:', uploadParams);
  
  //     const uploadResponse = await uploadAvatar(uploadParams);
  //     console.log('Resposta do upload:', JSON.stringify(uploadResponse, null, 2));
  
  //     if (uploadResponse[0].ERRO) {
  //       Alert.alert('Erro', uploadResponse[0].MSG_ERRO || 'Falha ao atualizar o avatar');
  //       return;
  //     }
  
  //     // Update the cache key to force re-render
  //     setImageCacheKey(Date.now().toString());
  
  //     // Reload profile from server to get the updated avatar URL
  //     await loadProfile();
  //     showToastMessage();

  //   } catch (error: any) {
  //     console.error('Erro ao fazer upload do avatar:', {
  //       message: error.message,
  //       response: error.response?.data,
  //       status: error.response?.status,
  //     });
  //     Alert.alert('Erro', 'Falha ao enviar o avatar para o servidor');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleEditAvatar = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria para selecionar uma imagem.');
        return;
      }
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      selectionLimit: 1,
    });

    if (result.didCancel) {
      console.log('Seleção de imagem cancelada');
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('Erro', 'Falha ao obter a imagem selecionada');
      return;
    }

    setIsLoading(true);
    try {
      const resizedImage = await ImageResizer.createResizedImage(
        asset.uri,
        200,
        200,
        'JPEG',
        80,
        0,
        undefined,
        true
      );

      const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');
      const context = getAuthContext();

      const uploadParams = {
        TITULO: passedTitulo,
        CHAVE: context.chave,
        AVATAR: base64Image,
      };

      console.log('Enviando upload com parâmetros:', uploadParams);

      const uploadResponse = await uploadAvatar(uploadParams);
      console.log('Resposta do upload:', JSON.stringify(uploadResponse, null, 2));

      if (uploadResponse[0].ERRO) {
        Alert.alert('Erro', uploadResponse[0].MSG_ERRO || 'Falha ao atualizar o avatar');
        return;
      }

      setImageCacheKey(Date.now().toString());
      await loadProfile();
      showToastMessage();

    } catch (error: any) {
      console.error('Erro ao fazer upload do avatar:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert('Erro', 'Falha ao enviar o avatar para o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const background = useThemeColor({}, 'background');
  const primaryText = useThemeColor({}, 'primaryText');
  const neutralBackground = useThemeColor({}, 'neutralBackground');
  const brand = useThemeColor({}, 'brand');
  const activeBackground = useThemeColor({}, 'activeBackground');
  const border = useThemeColor({}, 'border');
  const error = useThemeColor({}, 'error');
  const successBackground = useThemeColor({}, 'successBackground');
  const contrastText = useThemeColor({}, 'contrastText');
  const neutralText = useThemeColor({}, 'neutralText');
  const textColor = useThemeColor({}, 'text');

  const showLogoutAndTheme = !route.params?.TITULO;

  const profileItems: ProfileItem[] = [
    {
      title: 'Dados pessoais',
      onPress: () => {
        // @ts-ignore
        navigation.navigate('personalData', {
          TITULO: passedTitulo,
          profile: JSON.stringify(profile),
        });
      },
    },
    {
      title: 'Calendário',
      onPress: () => {
        // @ts-ignore
        navigation.navigate('calendar', { TITULO: passedTitulo, NOME: profile.NOME });
      },
    },
    // Substitui Preferências de notificações por Inscrições se houver TITULO na rota
    !route.params?.TITULO
      ? {
          title: 'Preferências de notificações',
          onPress: () => {
            // @ts-ignore
            navigation.navigate('notificationPreferences', { TITULO: passedTitulo });
          },
        }
      : {
          title: 'Inscrições',
          onPress: () => {
            // @ts-ignore
            navigation.navigate('(tabs)/(registrations)/home', { TITULO: passedTitulo });
          },
        },
    // Adiciona o tema escuro só se for o próprio usuário
    ...(showLogoutAndTheme
      ? [{
          title: 'Tema escuro',
          isSwitch: true,
          switchValue: darkMode,
          onSwitchChange: handleSwitchChange,
        }]
      : []),
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    profileHeader: {
      alignItems: 'center',
      marginVertical: 0,
      padding: 25,
    },
    profileImageContainer: {
      position: 'relative',
      borderRadius: 50,
      overflow: 'hidden',
    },
    profileImage: {
      width: 80,
      height: 80,
    },
    initialsAvatar: { 
      width: 80, 
      height: 80, 
      borderRadius: 40, 
      backgroundColor: neutralBackground, 
      justifyContent: 'center', 
      alignItems: 'center',
    },
    editLabel: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: activeBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 10,
      color: brand,
      textAlign: 'center',
    },
    profileName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 10,
      color: primaryText,
    },
    profileId: {
      fontSize: 16,
      color: neutralText,
      marginTop: 5,
    },
    itemContainer: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: activeBackground,
      borderBottomWidth: 1,
      borderBottomColor: border,
    },
    itemContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleText: {
      fontSize: 16,
      color: primaryText,
    },
    profileItemsContainer: {
      backgroundColor: activeBackground,
      borderRadius: 16,
      overflow: 'hidden',
      marginHorizontal: 25,
    },
    logoutButton: {
      margin: 20,
      paddingVertical: 15,
      backgroundColor: error,
      borderRadius: 16,
      alignItems: 'center',
    },
    logoutButtonText: {
      fontSize: 16,
      color: contrastText,
      fontWeight: 'bold',
    },
    toast: {
      position: 'absolute',
      top: 90,
      left: 16,
      right: 16,
      backgroundColor: successBackground,
      padding: 16,
      borderRadius: 12,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    toastTitle: {
      fontWeight: 'bold',
      fontSize: 15,
      color: contrastText,
    },
    toastMessage: {
      fontSize: 13,
      color: contrastText,
      marginTop: 4,
    },
  });

  const renderItem = (item: ProfileItem, index: number) => {
    return (
      <TouchableOpacity
        key={item.title}
        style={styles.itemContainer}
        onPress={item.onPress}
      >
        <View style={styles.itemContent}>
          <ThemedText style={styles.titleText}>{item.title}</ThemedText>
          {item.isSwitch ? (
            <Switch
              value={item.switchValue}
              onValueChange={item.onSwitchChange}
            />
          ) : (
            <IconSymbol name="chevron-right" color="#666" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Perfil" backRoute="/(tabs)/home" />
      <Wrapper isLoading={isLoading}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {profile?.AVATAR ? (
              <Image
                style={styles.profileImage}
                source={{
                  uri: `${profile?.AVATAR}?cacheBust=${imageCacheKey}`,
                  cache: 'reload',
                }}
                key={imageCacheKey}
              />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={{ fontSize: 30, color: primaryText, fontWeight: '500' }}>
                  {profile?.NOME.replace(/[^a-zA-Z\s]/g, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={handleEditAvatar}>
              <Text style={styles.editLabel}>Editar</Text>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.profileName}>{profile?.NOME}</ThemedText>
          <ThemedText style={styles.profileId}>{profile?.TITULO}</ThemedText>
        </View>
        <View style={styles.profileItemsContainer}>
          {profileItems.map((item, index) => renderItem(item, index))}
        </View>
        {/* Só mostra o botão de logout se for o próprio usuário */}
        {showLogoutAndTheme && (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Finalizar Sessão Do Aplicativo</Text>
          </TouchableOpacity>
        )}
        <View style={{ alignItems: 'center' }}>
          {/* <Text style={{ color: textColor, marginTop: 0, fontSize: 11, }}>Versão {version}</Text> */}
        </View>
      </Wrapper>
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastTitle}>✅ Tudo certo!</Text>
          <Text style={styles.toastMessage}>Dados salvos com sucesso!</Text>
        </Animated.View>
      )}
    </View>
  );
};

export default Profile;