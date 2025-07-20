import { listarAnexosURL, exibirOcorrencia } from '@/api/app/ouvidoria';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

const AudioDenuncia = ({ navigation, route }: any) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [respostaSecretaria, setRespostaSecretaria] = useState<string | null>(null);

  // Pega dados do item da rota
  const item = route?.params?.item || {};

  const getStatusColor = (status: string) => {
    if (!status) return '#9e9e9e';
    if (status.includes('Aguardando')) return '#ff9800';
    if (status.includes('Não adotada')) return '#9e9e9e';
    if (status.includes('Respondida')) return '#4caf50';
    return '#9e9e9e';
  };

  useEffect(() => {
    const fetchAnexos = async () => {
      if (route?.params?.item) {
        const anexos = await listarAnexosURL(route.params.item.IDOCORRENCIA);
        if (anexos && anexos.length > 0 && anexos[0].LINK_ARQUIVO) {
          setAudioUrl(anexos[0].LINK_ARQUIVO);
        }
        // Busca resposta da secretaria
        const ocorrencia = await exibirOcorrencia(route.params.item.IDOCORRENCIA);
        setRespostaSecretaria(ocorrencia?.RESPOSTA || null);
      }
    };
    fetchAnexos();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [route]);

  const handlePlayPress = async () => {
    try {
      if (!audioUrl) return;
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      setProgress(0);
      setDuration(0);
      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setProgress(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setProgress(0);
          }
        }
      });
    } catch (err) {
      setIsPlaying(false);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor((millis || 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Theme colors
  const background = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'background2');
  const iconBg = useThemeColor({}, 'background2');
  const titleColor = useThemeColor({}, 'text');
  const dateColor = useThemeColor({}, 'text2');
  const labelColor = useThemeColor({}, 'text2');
  const valueColor = useThemeColor({}, 'text');
  const sectionTitleColor = useThemeColor({}, 'text');
  const responseTextColor = useThemeColor({}, 'text2');
  const playButtonBg = useThemeColor({}, 'brand');
  const progressBg = useThemeColor({}, 'background1');
  const progressBar = useThemeColor({}, 'brand');
  const brand = useThemeColor({}, 'brand');

  return (
    <>
      <Header title="Detalhes da manifestação" />
      <Wrapper style={[styles.container, { backgroundColor: background }]}> 
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconPlaceholder, { backgroundColor: iconBg }]} >
            <IconSymbol
              library="fontawesome"
              name="microphone"
              size={50}
              color={brand}
            />
          </View>
          <Text style={[styles.title, { color: titleColor }]}>Áudio</Text>
          <Text style={[styles.date, { color: dateColor }]}>{item.DATA || '-'}</Text>
        </View>

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}> 
          <View style={styles.row}>
            <Text style={[styles.label, { color: labelColor }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.STATUS) }]}> 
              <Text style={styles.statusText}>{item.STATUS || '-'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: labelColor }]}>Protocolo</Text>
            <Text style={[styles.value, { color: valueColor }]}>{item.PROTOCOLO || '-'}</Text>
          </View>
        </View>

        {/* Clípe de Áudio */}
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>CLIPE DE ÁUDIO</Text>
        <View style={[styles.audioCard, { backgroundColor: cardBackground }]}> 
          <TouchableOpacity style={[styles.playButton, { backgroundColor: playButtonBg }]} onPress={handlePlayPress} disabled={!audioUrl}>
            <IconSymbol
              library="fontawesome"
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <View style={[styles.progressBarBackground, { backgroundColor: progressBg }]}> 
            <View style={[styles.progressBarFill, { width: duration ? `${(progress / duration) * 100}%` : '0%', backgroundColor: progressBar }]} />
          </View>
          <Text style={{ color: labelColor, fontSize: 12, marginLeft: 8 }}>{formatTime(progress)} / {formatTime(duration)}</Text>
        </View>

        {/* Resposta */}
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>RESPOSTA DA SECRETARIA</Text>
        <View style={[styles.responseCard, { backgroundColor: cardBackground }]}> 
          <Text style={[styles.responseText, { color: responseTextColor }]}>{respostaSecretaria ? respostaSecretaria : 'Nenhuma resposta atribuída.'}</Text>
        </View>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff', // keep white for contrast
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  audioCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 6,
    flex: 1,
    borderRadius: 10,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 10,
  },
  responseCard: {
    borderRadius: 20,
    padding: 16,
  },
  responseText: {
    fontSize: 14,
  },
});

export default AudioDenuncia;
