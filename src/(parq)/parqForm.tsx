import { View, Text, Image, TouchableOpacity, Modal, PermissionsAndroid, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import FileUploadBox from '../components/FileUploadBox';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
import RNFS from 'react-native-fs';
import { gravarArquivosParq, exibirArquivosParq } from '@/api/app/parq';
import { useError } from '@/providers/ErrorProvider';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function parqForm() {
  const route = useRoute<any>();
  const usuario = route.params?.usuario;
  const navigation = useNavigation();
  const { setError } = useError();

  const background = useThemeColor({}, 'background');
  const text2 = useThemeColor({}, 'text2');
  const tertiaryText = useThemeColor({}, 'tertiaryText');
  const background2 = useThemeColor({}, 'background2');
  const brand = useThemeColor({}, 'brand');
  const accent = useThemeColor({}, 'accent');

  // Flags para mostrar campos
  const precisaAtestado = !!usuario?.ATESTADO_PARQ;
  const precisaAutorizacao = !!usuario?.AUTORIZACAO_PARQ;
  const isMenor15 = precisaAtestado && precisaAutorizacao;

  // Se não precisa de nenhum documento, vai direto para próxima tela removendo do histórico
  if (!precisaAtestado && !precisaAutorizacao) {
    (navigation as any).replace('parqQuestions', { usuario });
    return null;
  }

  // States para URIs e base64
  const [atestadoUri, setAtestadoUri] = useState<string | null>(null);
  const [atestadoBase64, setAtestadoBase64] = useState<string | null>(null);
  const [autorizacaoUri, setAutorizacaoUri] = useState<string | null>(null);
  const [autorizacaoBase64, setAutorizacaoBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [atestadoUrl, setAtestadoUrl] = useState<string | null>(null);
  const [autorizacaoUrl, setAutorizacaoUrl] = useState<string | null>(null);
  const [loadingArquivos, setLoadingArquivos] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  useEffect(() => {
    const fetchArquivos = async () => {
      if (!usuario?.TITULO) {
        setLoadingArquivos(false);
        return;
      }
      try {
        const resp = await exibirArquivosParq(usuario.TITULO);
        if (resp && resp[0]) {
          if (resp[0].ATESTADO) setAtestadoUrl(resp[0].ATESTADO);
          if (resp[0].AUTORIZACAO) setAutorizacaoUrl(resp[0].AUTORIZACAO);
        }
      } catch (e) {
        // Não faz nada, só não mostra
      }
      setLoadingArquivos(false);
    };
    //fetchArquivos();
  }, [usuario?.TITULO]);

  // Função genérica para selecionar imagem e converter para base64
  // const selecionarArquivo = async (
  //   setUri: (uri: string) => void,
  //   setBase64: (b64: string) => void,
  //   clearUrl?: () => void
  // ) => {
  //   const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (!permissao.granted) {
  //     alert('Permissão necessária para acessar arquivos.');
  //     return;
  //   }
  //   const resultado = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 0.8,
  //   });
  //   if (!resultado.canceled && resultado.assets?.length) {
  //     const uri = resultado.assets[0].uri;
  //     setUri(uri);
  //     if (clearUrl) clearUrl();

  //     const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri;

  //     const exists = await RNFS.exists(path);
  //     if (exists) {
  //       const fileInfo = await RNFS.stat(path); // Se você quiser manter a variável
  //       const base64 = await RNFS.readFile(path, 'base64');
  //       setBase64(base64);
  //     }
  //   }
  // };

  const selecionarArquivo = async (
    setUri: (uri: string) => void,
    setBase64: (b64: string) => void,
    clearUrl?: () => void
  ) => {
    if (Platform.OS === 'android') {
      const permissao = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (permissao !== PermissionsAndroid.RESULTS.GRANTED) {
        alert('Permissão necessária para acessar arquivos.');
        return;
      }
    }

    const resultado = await launchImageLibrary({
      mediaType: 'mixed',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (!resultado.didCancel && resultado.assets?.length) {
      const uri = resultado.assets[0].uri;
      setUri(uri);
      if (clearUrl) clearUrl();

      const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
      const exists = await RNFS.exists(path);
      if (exists) {
        const base64 = await RNFS.readFile(path, 'base64');
        setBase64(base64);
      }
    }
  };

  // Função para extrair nome do arquivo do URI
  const getFileName = (uri: string) => {
    if (!uri) return '';
    return uri.split('/').pop() || uri;
  };

  // Função para checar se é imagem
  const isImage = (uri: string) => {
    if (!uri) return false;
    return uri.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
  };

  // Função para checar se é PDF
  const isPdf = (uri: string) => {
    if (!uri) return false;
    return uri.match(/\.pdf$/i);
  };

  // Funções de upload
  const handleUploadAtestado = () => selecionarArquivo(setAtestadoUri, setAtestadoBase64, () => setAtestadoUrl(null));
  const handleUploadAutorizacao = () => selecionarArquivo(setAutorizacaoUri, setAutorizacaoBase64, () => setAutorizacaoUrl(null));

  // Função para baixar arquivo de uma URL e converter para base64
  const fetchFileAsBase64 = async (url: string) => {
    try {
      if (!url) return '';

      const localPath = RNFS.CachesDirectoryPath + '/' + getFileName(url);
      const response = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
      }).promise;

      if (response && response.statusCode === 200) {
        const base64 = await RNFS.readFile(localPath, 'base64');
        return base64;
      }

      return '';
    } catch (e) {
      return '';
    }
  };

  // Função para enviar arquivos para o backend
  const handleEnviarArquivos = async () => {
    if ((precisaAutorizacao && !autorizacaoBase64 && !autorizacaoUrl) || (!isMenor15 && precisaAtestado && !atestadoBase64 && !atestadoUrl)) {
      setError('Por favor, selecione todos os arquivos obrigatórios antes de continuar.', 'error');
      return false;
    }
    if ((precisaAtestado ? !!atestadoUrl : true) && (precisaAutorizacao ? !!autorizacaoUrl : true) && !atestadoBase64 && !autorizacaoBase64) {
      return true;
    }
    setUploading(true);
    try {
      let atestado = '';
      let autorizacao = '';
      if (precisaAtestado && !isMenor15) {
        if (atestadoBase64) {
          atestado = atestadoBase64;
        } else if (atestadoUrl) {
          atestado = await fetchFileAsBase64(atestadoUrl);
        }
      } else if (precisaAtestado && isMenor15) {
        if (atestadoBase64) {
          atestado = atestadoBase64;
        } else if (atestadoUrl) {
          atestado = await fetchFileAsBase64(atestadoUrl);
        }
      }
      if (precisaAutorizacao) {
        if (autorizacaoBase64) {
          autorizacao = autorizacaoBase64;
        } else if (autorizacaoUrl) {
          autorizacao = await fetchFileAsBase64(autorizacaoUrl);
        }
      }
      const resp = await gravarArquivosParq(usuario?.TITULO, atestado, autorizacao);
      if (resp[0]?.ERRO) {
        setError(resp[0].MSG_ERRO || 'Erro ao enviar arquivos.', 'error');
        setUploading(false);
        return false;
      }
      setError('Arquivos enviados com sucesso!', 'success');
      setUploading(false);
      return true;
    } catch (e) {
      setError('Erro ao enviar arquivos. Tente novamente.', 'error');
      setUploading(false);
      return false;
    }
  };

  // Função para renderizar o texto com partes em negrito
  const renderInfoText = () => {
    if (isMenor15) {
      return (
        <Text style={{ color: tertiaryText, fontSize: 16, marginBottom: 16, lineHeight: 22 }}>
          Com base no seu perfil de idade,{' '}
          <Text style={{ fontWeight: 'bold', color: text2 }}>
            é necessário apresentar autorização por escrito de pai ou responsável
          </Text>{' '}
          para participar das atividades do clube. Por favor, insira-a abaixo.
        </Text>
      );
    } else if (precisaAtestado && precisaAutorizacao) {
      return (
        <Text style={{ color: tertiaryText, fontSize: 16, marginBottom: 16, lineHeight: 22 }}>
          Com base no seu perfil de idade,{' '}
          <Text style={{ fontWeight: 'bold', color: text2 }}>
            é necessário apresentar atestado médico e autorização por escrito de pai ou responsável
          </Text>{' '}
          para participar das atividades do clube. Por favor, insira-os abaixo.
        </Text>
      );
    } else if (precisaAtestado) {
      return (
        <Text style={{ color: tertiaryText, fontSize: 16, marginBottom: 16, lineHeight: 22 }}>
          Com base no seu perfil de idade,{' '}
          <Text style={{ fontWeight: 'bold', color: text2 }}>
            é necessário apresentar atestado médico
          </Text>{' '}
          para participar das atividades do clube. Por favor, insira-o abaixo.
        </Text>
      );
    }
    return null;
  };

  return (
    <>
      <Header title="PAR-Q" />
      <Wrapper
        style={{ padding: 16, backgroundColor: background }}
        useScrollView
        isLoading={loadingArquivos}
        primaryButtonLabel={uploading ? 'Enviando...' : 'Enviar'}
        onPrimaryPress={async () => {
          if (uploading) return;
          const ok = await handleEnviarArquivos();
          if (ok) {
            (navigation as any).replace('parqQuestions', { usuario });
          }
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 24, flexDirection: 'row', justifyContent: 'flex-start', gap: 16 }}>
          <Text style={{ color: tertiaryText, fontSize: 13, marginBottom: 8 }}>ASSOCIADO:</Text>
          <Image width={60} height={60} style={{ borderRadius: 30 }} source={{ uri: usuario?.AVATAR }} />
          <Text style={{ color: tertiaryText, fontSize: 13, marginBottom: 8 }}>{usuario?.NOME}</Text>
        </View>
        {renderInfoText()}
        {precisaAtestado && (
          <View>
            <Text style={{ color: tertiaryText, fontWeight: '400', fontSize: 13, marginBottom: 0 }}>
              ANEXAR ATESTADO MÉDICO{isMenor15 ? ' (opcional)' : ''}
            </Text>
            {!atestadoUri && !atestadoUrl && <FileUploadBox label={'Adicionar Arquivo'} onPress={handleUploadAtestado} />}
            {atestadoUri && isImage(atestadoUri) && (
              <TouchableOpacity onPress={handleUploadAtestado}>
                <Image source={{ uri: atestadoUri }} style={{ width: 120, height: 120, borderRadius: 8, marginVertical: 8 }} />
              </TouchableOpacity>
            )}
            {atestadoUri && isPdf(atestadoUri) && (
              <View style={{ marginVertical: 8, alignItems: 'center' }}>
                <Text style={{ color: tertiaryText, fontSize: 14 }}>{getFileName(atestadoUri)}</Text>
              </View>
            )}
            {!atestadoUri && atestadoUrl && (
              isImage(atestadoUrl) ? (
                <TouchableOpacity onPress={handleUploadAtestado}>
                  <Image source={{ uri: atestadoUrl }} style={{ width: 120, height: 120, borderRadius: 8, marginVertical: 8 }} />
                </TouchableOpacity>
              ) : isPdf(atestadoUrl) ? (
                <View style={{ marginVertical: 8, alignItems: 'center' }}>
                  <Text style={{ color: tertiaryText, fontSize: 14 }}>{getFileName(atestadoUrl)}</Text>
                </View>
              ) : null
            )}
          </View>
        )}
        {precisaAutorizacao && (
          <View>
            <Text style={{ color: tertiaryText, fontWeight: '400', fontSize: 13, marginTop: 24, marginBottom: 0 }}>
              ANEXAR AUTORIZAÇÃO DE RESPONSÁVEL
            </Text>
            {!autorizacaoUri && !autorizacaoUrl && <FileUploadBox label={'Adicionar Arquivo'} onPress={handleUploadAutorizacao} />}
            {autorizacaoUri && isImage(autorizacaoUri) && (
              <TouchableOpacity onPress={handleUploadAutorizacao}>
                <Image source={{ uri: autorizacaoUri }} style={{ width: 120, height: 120, borderRadius: 8, marginVertical: 8 }} />
              </TouchableOpacity>
            )}
            {autorizacaoUri && isPdf(autorizacaoUri) && (
              <View style={{ marginVertical: 8, alignItems: 'center' }}>
                <Text style={{ color: tertiaryText, fontSize: 14 }}>{getFileName(autorizacaoUri)}</Text>
              </View>
            )}
            {!autorizacaoUri && autorizacaoUrl && (
              isImage(autorizacaoUrl) ? (
                <TouchableOpacity onPress={handleUploadAutorizacao}>
                  <Image source={{ uri: autorizacaoUrl }} style={{ width: 120, height: 120, borderRadius: 8, marginVertical: 8 }} />
                </TouchableOpacity>
              ) : isPdf(autorizacaoUrl) ? (
                <View style={{ marginVertical: 8, alignItems: 'center' }}>
                  <Text style={{ color: tertiaryText, fontSize: 14 }}>{getFileName(autorizacaoUrl)}</Text>
                </View>
              ) : null
            )}
          </View>
        )}
        <View style={{ marginTop: 32 }}>
          <TouchableOpacity onPress={() => setShowBottomSheet(true)} activeOpacity={0.8}>
            <View style={{ backgroundColor: '#E050971A', borderRadius: 24, paddingVertical: 12, alignItems: 'center', opacity: 1 }}>
              <Text style={{ color: accent, fontSize: 17, fontWeight: '600' }}>Saiba mais</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Wrapper>

      {/* BottomSheet Modal */}
      <Modal
        visible={showBottomSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: background2, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#2A3147', marginBottom: 16 }} />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: text2, marginBottom: 12, textAlign: 'center' }}>
                Requisitos por Faixa Etária
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: tertiaryText, marginBottom: 12, textAlign: 'left' }}>
              Para garantir a segurança e o bem-estar de todos, o Clube estabelece algumas exigências com base na faixa etária dos associados.
              {'\n\n'}
              Algumas idades não se enquadram no questionário PAR-Q e, por isso, é necessário comprovar aptidão por outros meios.
              {'\n\n'}
              . Associados menores de 14 anos devem apresentar autorização por escrito dos pais ou responsáveis legais.
              {'\n\n'}
              . Associados acima de 70 anos devem apresentar atestado médico.
              {'\n\n'}
              Após a entrega desses documentos, os associados estão aptos a participar das atividades oferecidas pelo clube.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: brand, borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 24 }}
              onPress={() => setShowBottomSheet(false)}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}