import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions, Linking } from 'react-native';
import { AvisoItem } from '@/api/app/appTransformer';
import { gravarAviso, excluirAviso } from '@/api/app/auth';
import { Wrapper } from '@/components/Wrapper';
import { listarAvisos } from '@/api/app/auth';
import { AssociadoResponseItem, listarDependentes } from '@/api/app/atividades';
import { useAuth } from '@/providers';
import Header from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getRouteByIdServico } from '@/constants/serviceRoutes';
import { useNavigation } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Notification() {
  const [originalNotifications, setOriginalNotifications] = useState<AvisoItem[]>([]);
  const [avisos, setAvisos] = useState<AvisoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<AssociadoResponseItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<AvisoItem | null>(null);
  const AuthContext = useAuth();
  const navigation = useNavigation();

  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const text = useThemeColor({}, 'text');
  const text2 = useThemeColor({}, 'text2');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const avisosResponse = await listarAvisos();
        setOriginalNotifications(avisosResponse);
        setAvisos(avisosResponse);

        const profileResponse = await listarDependentes({ TITULO: AuthContext.user });
        const userProfile = profileResponse.find((item) => item.TITULO === AuthContext.user);
        setProfile(userProfile || null);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  const backgroundColor = useThemeColor({}, 'background');

  const handleClick = async (item: AvisoItem) => {
    setSelectedItem(item);
    setModalVisible(true);
    try {
      await gravarAviso({ IDAVISO: item.IDAVISO });
    } catch (e) {
      // Pode adicionar tratamento de erro se quiser
      console.error('Erro ao gravar aviso:', e);
    }
  };

  const handleViewLink = async (link: string) => {
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        console.error('Não é possível abrir o link:', link);
      }
    } catch (error) {
      console.error('Erro ao abrir o link:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    wrapper: {
      flex: 1,
    },
    activitiesContainer: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    activityTextContainer: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 17,
      fontWeight: '500',
    },
    activitySubtitle: {
      fontSize: 13,
      marginTop: 2,
    },
    profileImageContainer: {
      marginRight: 10,
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
    },
    arrowContainer: {},
    arrowText: {
      fontSize: 30,
      fontWeight: '600',
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      minHeight: 150,
    },
    emptyStateText: {
      fontSize: 16,
      textAlign: 'center',
      backgroundColor: backgroundColor,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      width: Dimensions.get('window').width,
      maxHeight: Dimensions.get('window').height * 0.5,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 15,
      fontWeight: '400',
      marginBottom: 10,
    },
    botaoContainer: {
      height: 'auto',
      width: '100%',
      padding: 16,
    },
    botao: {
      backgroundColor: '#DA1984',
      padding: 13,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    },
    botaoAlt: {
      color: '#DA1984',
      padding: 13,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    },
    textoBotaoAlt: {
      color: '#DA1984',
      fontWeight: 'bold',
      fontSize: 16,
    },
    textoBotao: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    dragHandle: {
      width: 60,
      height: 5,
      borderRadius: 2.5,
      alignSelf: 'center',
      marginBottom: 10,
    },
  });

  return (
    <>
      <View style={[styles.container, { backgroundColor: background }]}>
        <Header title="Notificações" backRoute="/(tabs)/home" />
        <Wrapper style={styles.wrapper} isLoading={isLoading}>
          {!isLoading && (
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <View style={[styles.activitiesContainer, { backgroundColor: background2 }]}>
                {(avisos.length === 0 || avisos[0].ERRO) ? (
                  <Text style={[styles.emptyStateText, { color: '#6f7791' }]}>Nenhuma notificação encontrada</Text>
                ) : (
                  avisos.map((aviso) => (
                    <TouchableOpacity
                      key={aviso.IDAVISO.toString()}
                      style={[
                        styles.activityItem,
                        {
                          backgroundColor: background2,
                          borderBottomColor: background2,
                        },
                      ]}
                      onPress={() => handleClick(aviso)}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: background2 }]}>
                        <IconSymbol name={aviso.ICONE} size={15} color="#878da3" library="fontawesome" />
                      </View>
                      <View style={styles.activityTextContainer}>
                        <Text
                          style={[
                            styles.activityTitle,
                            { color: aviso.LEITURA ? '#a0a0a0' : text2 }
                          ]}
                        >
                          {aviso.ASSUNTO}
                        </Text>
                        <Text style={[styles.activitySubtitle, { color: '#6f7791' }]}>{aviso.DATA}</Text>
                      </View>
                      <View style={styles.profileImageContainer}>
                        <Image
                          style={[styles.profileImage, { borderColor: '#4389e8' }]}
                          source={{ uri: profile?.AVATAR || 'https://via.placeholder.com/100' }}
                        />
                      </View>
                      <View style={styles.arrowContainer}>
                        <Text style={[styles.arrowText, { color: '#b7bbcb' }]}>›</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}
        </Wrapper>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: background2 }]}>
            <View style={[styles.dragHandle, { backgroundColor: '#ccc' }]} />
            <ScrollView>
              {selectedItem && (
                <>
                  <ThemedText style={[styles.modalTitle, { color: text2 }]}>{selectedItem.ASSUNTO}</ThemedText>
                  <ThemedText style={[styles.modalText, { color: '#6f7791' }]}>Data: {selectedItem.DATA}</ThemedText>
                  <ThemedText style={[styles.modalText, { color: '#6f7791' }]}>{selectedItem.DESCRICAO}</ThemedText>
                  {/* Botão condicional */}
                  {selectedItem.EXIBIR_LINK && selectedItem.LINK_ARQUIVO ? (
                    <View style={[styles.botaoContainer, { backgroundColor: background2 }]}>
                      <TouchableOpacity
                        style={styles.botao}
                        onPress={() => handleViewLink(selectedItem.LINK_ARQUIVO)}
                      >
                        <Text style={styles.textoBotao}>Abrir Link</Text>
                      </TouchableOpacity>
                    </View>
                  ) : selectedItem.IDSERVICO ? (
                    <View style={[styles.botaoContainer, { backgroundColor: background2 }]}>
                      <TouchableOpacity
                        style={styles.botao}
                        onPress={() => {
                          const routeObj = getRouteByIdServico(selectedItem.IDSERVICO);
                          if (routeObj) {
                            setModalVisible(false);
                            setTimeout(() => {
                              navigation.navigate(routeObj.route, routeObj.params);
                            }, 300);
                          } else {
                            console.log('Nenhuma rota encontrada para', selectedItem.IDSERVICO);
                          }
                        }}
                      >
                        <Text style={styles.textoBotao}>Visualizar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.botaoAlt}
                        onPress={async () => {
                          if (!selectedItem) return;
                          try {
                            const res = await excluirAviso({ IDAVISO: selectedItem.IDAVISO });
                            if (res[0]?.ERRO) {
                              console.error('Erro ao excluir aviso:', res[0]?.MSG_ERRO);
                            } else {
                              // Remove aviso da lista
                              setAvisos((prev) => prev.filter((a) => a.IDAVISO !== selectedItem.IDAVISO));
                              setModalVisible(false);
                            }
                          } catch (e) {
                            console.error('Erro ao excluir aviso:', e);
                          }
                        }}
                      >
                        <Text style={styles.textoBotaoAlt}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

