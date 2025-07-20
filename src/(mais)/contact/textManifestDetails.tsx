import { AnexoURL, listarAnexosURL } from '@/api/app/ouvidoria';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DenunciaDetalheProps {
  route: {
    params: {
      item: {
        IDOCORRENCIA: number;
        DATA: string;
        TIPO: string;
        MOTIVO: string;
        PROTOCOLO: string;
        STATUS: string;
        AVALIAR: boolean;
        RECORRER: boolean;
      };
    };
  };
}

const DenunciaDetalhe = ({ route }: DenunciaDetalheProps) => {
  const { item } = route.params;
  const [anexos, setAnexos] = useState<AnexoURL[]>([]);
  const [loadingAnexos, setLoadingAnexos] = useState(true);
  const [visible, setVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Theme colors
  const background = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'background2');
  const iconBg = useThemeColor({}, 'background2');
  const titleColor = useThemeColor({}, 'text');
  const dateColor = useThemeColor({}, 'text2');
  const labelColor = useThemeColor({}, 'text2');
  const valueColor = useThemeColor({}, 'text');
  const sectionTitleColor = useThemeColor({}, 'text');
  const descriptionColor = useThemeColor({}, 'text2');
  const mediaNameColor = useThemeColor({}, 'text2');
  const activityIndicatorColor = useThemeColor({}, 'brand');
  const brand = useThemeColor({}, 'brand');
  const mediaPlaceholderBg = useThemeColor({}, 'background1');

  useEffect(() => {
    const fetchAnexos = async () => {
      try {
        const data = await listarAnexosURL(item.IDOCORRENCIA);
        setAnexos(data);
      } catch (error) {
        console.error('Erro ao buscar anexos:', error);
      } finally {
        setLoadingAnexos(false);
      }
    };

    fetchAnexos();
  }, [item.IDOCORRENCIA]);

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'Elogio':
        return 'smile';
      case 'Sugestão':
        return 'lightbulb';
      case 'Reclamação':
        return 'exclamation-circle';
      case 'Denúncia':
        return 'bullhorn';
      case 'Áudio':
        return 'microphone';
      default:
        return 'question-circle';
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Aguardando')) return '#ff9800';
    if (status.includes('Não adotada')) return '#9e9e9e';
    if (status.includes('Respondida')) return '#4caf50';
    return '#9e9e9e';
  };

  // Prepara as imagens para o ImageViewing
  const images = anexos
    .filter(anexo => anexo.LINK_ARQUIVO)
    .map(anexo => ({ uri: anexo.LINK_ARQUIVO }));

  const openImage = (index: number) => {
    setCurrentImageIndex(index);
    setVisible(true);
  };

  return (
    <>
      <Header title="Detalhes da manifestação" />
      <Wrapper style={[styles.container, { backgroundColor: background }]}> 
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconPlaceholder, { backgroundColor: iconBg }]}> 
              <IconSymbol
                library="fontawesome"
                name={getIconByType(item.TIPO)}
                size={40}
                color={brand}
              />
            </View>
            <Text style={[styles.title, { color: titleColor }]}>{item.TIPO}</Text>
            <Text style={[styles.date, { color: dateColor }]}>{item.DATA}</Text>
          </View>

          {/* Info Card */}
          <View style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.statusRow}>
              <Text style={[styles.label, { color: labelColor }]}>Status</Text>
              <Text style={[styles.status, { backgroundColor: getStatusColor(item.STATUS) }]}>
                {item.STATUS}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.label, { color: labelColor }]}>Protocolo</Text>
              <Text style={[styles.value, { color: valueColor }]}>{item.PROTOCOLO}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.label, { color: labelColor }]}>Data da ocorrência</Text>
              <Text style={[styles.value, { color: valueColor }]}>{item.DATA}</Text>
            </View>
          </View>

          {/* Descrição */}
          {item.MOTIVO && item.MOTIVO.trim() !== '' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>DESCRIÇÃO</Text>
              <Text style={[styles.description, { color: descriptionColor }]}>{item.MOTIVO}</Text>
            </View>
          )}

          {/* Mídia */}
          {loadingAnexos ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>MÍDIA</Text>
              <ActivityIndicator size="small" color={activityIndicatorColor} />
            </View>
          ) : (
            anexos.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>MÍDIA</Text>
                {anexos.map((anexo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.mediaContainer}
                    onPress={() => openImage(index)}
                    activeOpacity={0.8}
                  >
                    {anexo.LINK_ARQUIVO && (
                      <>
                        <Image
                          source={{ uri: anexo.LINK_ARQUIVO }}
                          style={styles.mediaImage}
                          resizeMode="contain"
                        />
                        <Text style={[styles.mediaName, { color: mediaNameColor }]}>{anexo.NOME_ARQUIVO}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )
          )}

          {/* Resposta */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>RESPOSTA DA OUVIDORIA</Text>
            <Text style={[styles.description, { color: descriptionColor }]}>
              {item.STATUS.includes('Respondida')
                ? 'Sua manifestação foi respondida pela ouvidoria.'
                : 'Sua manifestação ainda está em análise.'}
            </Text>
          </View>
        </ScrollView>

        {/* Visualizador de imagens */}
        <ImageViewing
          images={images}
          imageIndex={currentImageIndex}
          visible={visible}
          onRequestClose={() => setVisible(false)}
          backgroundColor="#000"
          swipeToCloseEnabled
          doubleTapToZoomEnabled
        />
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  mediaContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  mediaName: {
    fontSize: 12,
  },
  container: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  date: {
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    color: '#fff', // keep white for contrast
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
});

export default DenunciaDetalhe;
