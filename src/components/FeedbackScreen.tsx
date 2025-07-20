import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import DropdownPicker from '@/components/DropdownPicker';
import instance from '../api/api';
import { AxiosResponse } from 'axios';
import { getAuthContext } from '@/providers/AuthProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';

interface FeedbackRatingProps {
  onClose: () => void;
  onHandleToastRatingFeedback: () => void;
  setMsgToast: () => void;
  setShowToastMsg: () => void;
  animationType?: 'fade' | 'slideUp' | 'slideDown' | 'zoom';
}

export interface OpcaoStatus {
  IDSTATUS: number;
  STATUS: string;
  ORDEM: number;
}

export interface FeedbackExperienciaResponse {
  OPCAO: OpcaoStatus[];
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

const FeedbackScreen: React.FC<FeedbackRatingProps> = ({
  onClose,
  onHandleToastRatingFeedback,
  setMsgToast,
  setShowToastMsg,
}) => {
  const [nota, setNota] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [opcoesDropdown, setOpcoesDropdown] = useState<{ value: string; label: string }[]>([]);
  const [statusSelecionado, setStatusSelecionado] = useState<string | null>(null);

  const fadeAnimModal = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const activeBackground = useThemeColor({}, 'activeBackground');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const inputBackground = useThemeColor({}, 'inputBackground'); // Dynamic input background
  const placeholderTextColor = useThemeColor({}, 'placeholderText'); // Dynamic placeholder text

  useEffect(() => {
    const fetchOpcoes = async () => {
      try {
        const context = getAuthContext();
        const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
        const Feedback = 'Alive.App/Feedback.asmx';
        const url = `${baseURL}/${Feedback}/ListarStatus`;
        const response: AxiosResponse<FeedbackExperienciaResponse[]> = await instance.get(url, {
          params: {
            TITULO: context.user,
            CHAVE: context.chave,
          },
        });

        const lista = response.data[0].OPCAO.map((item: any) => ({
          value: item.IDSTATUS,
          label: item.STATUS,
        }));

        setStatusSelecionado(lista[0].value);
        setOpcoesDropdown(lista);
      } catch (error) {
        console.error('Erro ao buscar opções do dropdown:', error);
      }
    };

    fetchOpcoes();
  }, []);

  const opcoesNota = [
    { value: '1', label: 'Muito ruim', emoji: require('../assets/images/rating-icon-1x.png'), color: '#E63946' },
    { value: '2', label: 'Ruim', emoji: require('../assets/images/rating-icon-2x.png'), color: '#F4A261' },
    { value: '3', label: 'Regular', emoji: require('../assets/images/rating-icon-3x.png'), color: '#2A9D8F' },
    { value: '4', label: 'Boa', emoji: require('../assets/images/rating-icon-4x.png'), color: '#3A86FF' },
    { value: '5', label: 'Muito boa', emoji: require('../assets/images/rating-icon-5x.png'), color: '#06D6A0' },
  ];

  const fecharComAnimacao = () => {
    Animated.timing(slideAnim, {
        toValue: 1000, // desliza 200px para baixo
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    };

  const sendExperienciaUser = async () => {
    if (!nota) {
      setMsgToast('Por favor, selecione uma nota.');
      setShowToastMsg(true);
      return;
    }

    if (!statusSelecionado) {
      setMsgToast('Por favor, selecione uma opção no dropdown.');
      setShowToastMsg(true);
      return;
    }

    try {
      const context = getAuthContext();
      const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
      const Feedback = 'Alive.App/Feedback.asmx';
      const url = `${baseURL}/${Feedback}/GravarExperiencia`;

      const params: Record<string, any> = {
        TITULO: context.user,
        CHAVE: context.chave,
        ...(nota ? { IDEXPERIENCIA: nota } : {}),
        ...(statusSelecionado ? { IDSTATUS: statusSelecionado } : {}),
        ...(comentario ? { COMENTARIO: comentario } : { COMENTARIO: ""}),
      };

      const response: AxiosResponse<FeedbackExperienciaResponse[]> = await instance.get(url, {
        params: params,
      });

      if (!response.data[0].ERRO) {
        fecharComAnimacao()
        onHandleToastRatingFeedback(true)
        setComentario('');
        setNota(null);
        setStatusSelecionado(null);
      } else {
        alert(`Erro: ${response.data[0].MSG_ERRO}`);
      }
    } catch (error) {
      console.error('Erro ao enviar experiência:', error);
      alert('Erro ao enviar experiência. Tente novamente.');
    }
  };

  const styles = StyleSheet.create({
    toast: {
      position: 'absolute',
      bottom: 100,
      left: 16,
      right: 16,
      backgroundColor: '#48BB78',
      padding: 16,
      borderRadius: 12,
      zIndex: 1000,
    },
    toastTitle: {
      fontWeight: 'bold',
      fontSize: 15,
      color: '#1A202C',
    },
    toastMessage: {
      fontSize: 13,
      color: '#1A202C',
      marginTop: 4,
    },
    closeText: {
      fontSize: 22,
      color: '#999',
    },
    closeButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 10,
      padding: 8,
    },
    contant: {
      paddingTop: 40,
      marginTop: 40,
      backgroundColor: 'gray',
      height: 650,
    },
    container: {
      flex: 1,
      backgroundColor: activeBackground,
      padding: 24,
      paddingTop: 50,
      marginBottom: 15,
      borderRadius: 16,
    },
    sectionContainer: {
      borderRadius: 20,
      backgroundColor: '#E2E7F8',
      overflow: 'hidden',
      padding: 0,
      marginVertical: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '400',
      textTransform: 'uppercase',
      marginBottom: 8,
      lineHeight: 20,
      color: textColor,
    },
    ratingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    ratingButton: {
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      borderRadius: 8,
      padding: 4,
      width: 60,
    },
    ratingLabel: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 4,
    },
    inputLabel: {
      // marginTop: 15,
      fontSize: 14,
      marginBottom: 4,
    },
    pickerContainer: {
      backgroundColor: inputBackground,
      borderRadius: 10,
      marginBottom: 15,
    },
    picker: {
      height: Platform.OS === 'ios' ? 200 : 50,
      width: '100%',
      color: textColor,
      backgroundColor: inputBackground,
    },
    textArea: {
      height: 80,
      backgroundColor: inputBackground,
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      textAlignVertical: 'top',
      color: textColor,
    },
    submitButton: {
      backgroundColor: '#DA1984',
      paddingVertical: 10,
      alignItems: 'center',
      marginBottom: 5 ,
      padding: 12,
      borderRadius: 16,
    },
    submitText: {
      fontWeight: 'bold',
      color: '#fff',
      // color: text2Color,
      // color: textColor,
    },
    cancelButton: {
      backgroundColor: '#F8D7E3',
      paddingVertical: 8,
      borderRadius: 16,
      alignItems: 'center',
    },
    cancelText: {
      fontWeight: 'bold',
    },
  });

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnimModal,
            transform: [{ translateY: slideAnim }]
          },
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={fecharComAnimacao}>
          <ThemedText style={styles.closeText}>×</ThemedText>
        </TouchableOpacity>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <ThemedText style={styles.title}>Avalie sua experiência</ThemedText>
        </View>
        <Text style={styles.subtitle}>O que você achou da experiência da sua nova tela inicial?</Text>

        <View style={styles.ratingRow}>
            {opcoesNota.map((opt) => (
            <TouchableOpacity
                key={opt.value}
                style={[styles.ratingButton, nota === opt.value && { borderColor: opt.color }]}
                onPress={() => setNota(opt.value)}
            >
                <Image source={opt.emoji} style={{ width: 32, height: 32, resizeMode: 'contain' }} />
                <ThemedText style={styles.ratingLabel}>{opt.label}</ThemedText>
            </TouchableOpacity>
            ))}
        </View>

        <DropdownPicker
          items={opcoesDropdown}
          onChangeValue={(val: React.SetStateAction<string | null>) => {
            return setStatusSelecionado(val);
          }}
        />

        <ThemedText style={styles.inputLabel}>Deixe a sua opinião (opcional)</ThemedText>
        <TextInput
            style={styles.textArea}
            value={comentario}
            onChangeText={setComentario}
            multiline
            placeholder="Digite aqui..."
            placeholderTextColor={placeholderTextColor}
        />

        <TouchableOpacity style={styles.submitButton} onPress={() => {
          sendExperienciaUser()
        }}>
            <ThemedText style={styles.submitText}>Enviar avaliação</ThemedText>
        </TouchableOpacity>

      </Animated.View>
     </>
  );
};

export default FeedbackScreen;
 