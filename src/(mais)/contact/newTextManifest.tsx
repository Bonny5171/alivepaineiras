import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  PermissionsAndroid, Platform 
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
import RNFS from 'react-native-fs';
import { gerarProtocolo, gravarImagem, GravarImagemParams, gravarOcorrencia, GravarOcorrenciaParams } from '@/api/app/ouvidoria';
import { useError } from '@/providers/ErrorProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useConfirmation } from '@/providers/ConfirmProvider';

const motivos = [
  { label: 'Elogio', value: 1 },
  { label: 'Sugestão', value: 2 },
  { label: 'Reclamação', value: 3 },
  { label: 'Denúncia', value: 4 },
  { label: 'Dúvida', value: 5 },
];

export default function ManifestacaoForm() {
  const route = useRoute();
  const navigation = useNavigation();
  const confirm = useConfirmation();

  const [motivoSelecionado, setMotivoSelecionado] = useState(route.params?.motivo || 3); // Padrão: Reclamação
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [autorizado, setAutorizado] = useState(true);
  const [imagem, setImagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Theme colors
  const background = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const accent = useThemeColor({}, 'brand');
  const fadedText = useThemeColor({}, 'text2');
  const inputBg = useThemeColor({}, 'background2');
  const inputText = useThemeColor({}, 'text');
  const radioBorder = useThemeColor({}, 'text2');
  const radioSelected = useThemeColor({}, 'brand');
  const uploadButtonBg = useThemeColor({}, 'background2');
  const uploadButtonText = useThemeColor({}, 'brand');
  const checkboxBg = useThemeColor({}, 'brand');
  const checkboxText = useThemeColor({}, 'text2');
  const removeImageBg = useThemeColor({}, 'redText');
  const removeImageText = useThemeColor({}, 'background');
  const placeholderText = useThemeColor({}, 'text3');

  const extractDateAndTime = (dateString: string) => {
    try {
      const [datePart, timePart] = dateString.split(' ');
      const formattedDate = datePart;
      const formattedTime = timePart.slice(0, 5);
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error('Erro ao extrair data e hora:', error);
      return { date: '', time: '' };
    }
  };

  useEffect(() => {
    if (route.params?.data) {
      const { date, time } = extractDateAndTime(route.params.data);
      setData(date);
      setHora(time);
    }
    if (route.params?.grupo && route.params?.taxa) {
      setDescricao(`Contestação referente à ${route.params.grupo} - ${route.params.taxa}`);
    }
  }, [route.params]);

  // const handleSelecionarImagem = async () => {
  //   const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

  //   if (!permissao.granted) {
  //     Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos.');
  //     return;
  //   }

  //   const resultado = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 0.8, // Reduzindo um pouco a qualidade para arquivos menores
  //   });

  //   if (!resultado.canceled) {
  //     setImagem(resultado.assets[0].uri);
  //   }
  // };

  const handleSelecionarImagem = async () => {
    // Solicita permissão apenas no Android
    if (Platform.OS === 'android') {
      const permissao = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permissão necessária',
          message: 'Precisamos da permissão para acessar suas fotos.',
          buttonPositive: 'OK',
        }
      );

      if (permissao !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos.');
        return;
      }
    }

    const resultado = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8, // reduz qualidade para arquivos menores
      maxWidth: 1200,
      maxHeight: 900,
      selectionLimit: 1,
    });

    if (resultado.didCancel) {
      return;
    }

    if (resultado.errorCode) {
      Alert.alert('Erro', resultado.errorMessage || 'Erro ao selecionar a imagem.');
      return;
    }

    if (resultado.assets && resultado.assets.length > 0) {
      setImagem(resultado.assets[0].uri);
    }
  };


  const removerImagem = () => {
    setImagem(null);
  };

  const validarFormulario = () => {
    if (!descricao.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, descreva sua manifestação.');
      return false;
    }

    if (!data.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, informe a data da ocorrência.');
      return false;
    }

    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(data)) {
      Alert.alert('Data inválida', 'Por favor, informe a data no formato DD/MM/AAAA.');
      return false;
    }

    if (!isValidDate(data.trim())) {
      Alert.alert('Campo obrigatório', 'Data inválida. Use o formato DD/MM/AAAA com uma data válida.');
      return false;
    }

    if (!hora.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, informe o horário da ocorrência.');
      return false;
    }

    const regexHora = /^\d{2}:\d{2}$/;
    if (!regexHora.test(hora)) {
      Alert.alert('Horário inválido', 'Por favor, informe o horário no formato HH:MM.');
      return false;
    }

    return true;
  };

  const converterImagemParaBase64 = async (uri: string) => {
    try {
      const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri;

      const exists = await RNFS.exists(path);
      if (!exists) {
        throw new Error('Arquivo não encontrado');
      }

      const base64 = await RNFS.readFile(path, 'base64');

      // Retorna apenas o Base64 puro, sem o prefixo
      return base64;
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      throw new Error('Não foi possível processar a imagem');
    }
  };

  const enviarImagem = async (idOcorrencia: number) => {
    if (!imagem) return;

    setUploadingImage(true);
    try {
      const imagemBase64 = await converterImagemParaBase64(imagem);

      const params: GravarImagemParams = {
        IDOCORRENCIA: idOcorrencia,
        IMAGEM: imagemBase64,
      };

      const response = await gravarImagem(params);

      if (response.ERRO) {
        console.error('Erro ao enviar imagem:', response.MSG_ERRO);
        // Não mostramos alerta para o usuário, pois a manifestação já foi enviada
      }
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const { setError } = useError();

  const handleEnviar = async () => {
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      await gerarProtocolo();
      // Primeiro envia a manifestação principal
      const params: GravarOcorrenciaParams = {
        DESCRICAO: descricao,
        IDMOTIVO: motivoSelecionado,
        PRIVADO: autorizado ? 0 : 1,
        LOCAL: '', // Adicione um campo para local se necessário
        DATA: data,
        HORA: hora,
      };

      const response = await gravarOcorrencia(params);

      if (response.ERRO) {
        setError(response.MSG_ERRO || 'Ocorreu um erro ao enviar a manifestação.', 'error');
        return;
      }

      // Se enviou com sucesso, agora envia a imagem (se houver)
      if (imagem) {
        await enviarImagem(response.IDOCORRENCIA);
      }

      setError('Manifestação enviada com sucesso!', 'success');

      // Limpar formulário após envio bem-sucedido
      setDescricao('');
      setData('');
      setHora('');
      setImagem(null);
      navigation.navigate("(tabs)");
    } catch (error) {
      console.error('Erro ao enviar manifestação:', error);
      setError('Não foi possível enviar a manifestação. Tente novamente mais tarde.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para validar a data
  const isValidDate = (dateString: string): boolean => {
    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(dateString)) return false;

    const [day, month, year] = dateString.split('/').map(Number);
    
    if (year < 1900 || year > 2100) return false;

    if (month < 1 || month > 12) return false;

    const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day < 1 || day > daysInMonth[month - 1]) return false;

    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() + 1 === month && date.getFullYear() === year;
  };

  // Função para verificar ano bissexto
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Função para aplicar máscara de data DD/MM/AAAA
  const maskDate = (value: string) => {
    // Remove tudo que não for número
    let v = value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    return v;
  };

  // Função para aplicar máscara de horário HH:MM
  const maskTime = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length > 2) v = v.replace(/(\d{2})(\d{1,2})/, '$1:$2');
    return v;
  };

  // Substituir onPrimaryPress do Wrapper para abrir o modal de confirmação
  return (
    <>
      <Header title="Manifestação via texto" />
      <Wrapper
        style={[styles.container, { backgroundColor: background }]}
        primaryButtonLabel={
          loading ? 'Enviando...' :
            uploadingImage ? 'Enviando imagem...' : 'Enviar'
        }
        onPrimaryPress={() => confirm.showConfirmation('Confirmação', handleEnviar)}
      >
        <ScrollView>
          <Text style={[styles.label, { color: fadedText }]}>MOTIVO DA MANIFESTAÇÃO</Text>

          {motivos.map((motivo) => (
            <TouchableOpacity
              key={motivo.value}
              style={styles.radioContainer}
              onPress={() => setMotivoSelecionado(motivo.value)}
            >
              <View style={[styles.radioCircle, { borderColor: radioBorder }]}>
                {motivoSelecionado === motivo.value && (
                  <View style={[styles.radioInner, { backgroundColor: radioSelected }]} />
                )}
              </View>
              <Text style={[styles.radioText, { color: fadedText }]}>{motivo.label}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.label, { color: fadedText }]}>DATA DA OCORRÊNCIA</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={placeholderText}
            value={data}
            onChangeText={(text) => setData(maskDate(text))}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={[styles.label, { color: fadedText }]}>HORÁRIO ESTIMADO DA OCORRÊNCIA</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
            placeholder="00:00"
            placeholderTextColor={placeholderText}
            value={hora}
            onChangeText={(text) => setHora(maskTime(text))}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={[styles.label, { color: fadedText }]}>DESCREVA SUA MANIFESTAÇÃO</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: inputText }]}
            placeholder="Digite sua manifestação..."
            placeholderTextColor={placeholderText}
            multiline
            numberOfLines={6}
            value={descricao}
            onChangeText={setDescricao}
          />

          <Text style={[styles.label, { color: fadedText }]}>ADICIONAR UMA FOTO (OPCIONAL)</Text>
          {imagem ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imagem }} style={styles.image} />
              {uploadingImage ? (
                <ActivityIndicator size="small" color={accent} style={styles.uploadIndicator} />
              ) : (
                <TouchableOpacity style={[styles.removeImageButton, { backgroundColor: removeImageBg }]} onPress={removerImagem}>
                  <Text style={[styles.removeImageText, { color: removeImageText }]}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: uploadButtonBg }]}
              onPress={handleSelecionarImagem}
              disabled={uploadingImage}
            >
              <IconSymbol library="fontawesome" name="image" size={40} color={fadedText} />
              <Text style={[styles.uploadButtonText, { color: uploadButtonText }]}>Adicionar Foto</Text>
            </TouchableOpacity>
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAutorizado(!autorizado)}
              disabled={loading || uploadingImage}
            >
              <View style={[styles.checkboxSquare, { backgroundColor: autorizado ? checkboxBg : inputBg }]}> 
                {autorizado && <IconSymbol library="material" name="check" size={16} color="#FFF" />}
              </View>
              <Text style={[styles.checkboxText, { color: fadedText }]}>Eu autorizo que interessados tenham acesso a este registro, inclusive com meus dados pessoais.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Wrapper>
    </>
  );
}

const styles = StyleSheet.create({
  uploadIndicator: {
    marginVertical: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  removeImageButton: {
    padding: 8,
    borderRadius: 5,
  },
  removeImageText: {
    fontWeight: 'bold',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  container: {
    padding: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderRadius: 12,
    padding: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  radioText: {
  },
  uploadButton: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 10,
  },
  uploadButtonText: {
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'flex-start',
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
  },
});
