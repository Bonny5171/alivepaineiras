import { listarAnexosURL, exibirOcorrencia } from '@/api/app/ouvidoria';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Sound from 'react-native-sound';

const AudioDenuncia = ({ navigation, route }: any) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Sound | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [respostaSecretaria, setRespostaSecretaria] = useState<string | null>(null);
  const intervalRef = useRef<any>(null);

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
        if (anexos?.[0]?.LINK_ARQUIVO) {
          setAudioUrl(anexos[0].LINK_ARQUIVO);
        }
        const ocorrencia = await exibirOcorrencia(route.params.item.IDOCORRENCIA);
        setRespostaSecretaria(ocorrencia?.RESPOSTA || null);
      }
    };
    fetchAnexos();

    return () => {
      if (sound) {
        sound.release();
        clearInterval(intervalRef.current);
      }
    };
  }, [route]);

  const handlePlayPress = () => {
    if (!audioUrl) return;

    if (sound) {
      sound.stop(() => {
        setIsPlaying(false);
        setProgress(0);
      });
      sound.release();
      setSound(null);
      clearInterval(intervalRef.current);
      return;
    }

    const newSound = new Sound(audioUrl, undefined, (error) => {
      if (error) return;
      setDuration(newSound.getDuration());
      setSound(newSound);
      setIsPlaying(true);

      newSound.play((success) => {
        if (success) {
          setIsPlaying(false);
          setProgress(0);
        }
        newSound.release();
        setSound(null);
        clearInterval(intervalRef.current);
      });

      intervalRef.current = setInterval(() => {
        newSound.getCurrentTime((seconds) => setProgress(seconds));
      }, 500);
    });
  };

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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
        <View style={styles.header}>
          <View style={[styles.iconPlaceholder, { backgroundColor: iconBg }]}>
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
          <Text style={{ color: labelColor, fontSize: 12, marginLeft: 8 }}>
            {formatTime(progress)} / {formatTime(duration)}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>RESPOSTA DA SECRETARIA</Text>
        <View style={[styles.responseCard, { backgroundColor: cardBackground }]}>
          <Text style={[styles.responseText, { color: responseTextColor }]}>{respostaSecretaria || 'Nenhuma resposta atribuída.'}</Text>
        </View>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  iconPlaceholder: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  date: { fontSize: 14 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  statusText: { fontSize: 12, color: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 12 },
  audioCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  playButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  progressBarBackground: { flex: 1, height: 6, borderRadius: 3, marginLeft: 12, overflow: 'hidden' },
  progressBarFill: { height: 6 },
  responseCard: { padding: 16, borderRadius: 12 },
  responseText: { fontSize: 14, lineHeight: 20 },
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   iconPlaceholder: {
//     width: 100,
//     height: 100,
//     borderRadius: 20,
//     marginBottom: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   date: {
//   },
//   card: {
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 24,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   label: {
//     fontSize: 14,
//   },
//   value: {
//     fontWeight: '600',
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   statusText: {
//     color: '#fff', // keep white for contrast
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   sectionTitle: {
//     fontWeight: 'bold',
//     marginBottom: 8,
//     marginTop: 12,
//   },
//   audioCard: {
//     borderRadius: 20,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 24,
//   },
//   playButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   playText: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   progressBarBackground: {
//     height: 6,
//     flex: 1,
//     borderRadius: 10,
//   },
//   progressBarFill: {
//     height: 6,
//     borderRadius: 10,
//   },
//   responseCard: {
//     borderRadius: 20,
//     padding: 16,
//   },
//   responseText: {
//     fontSize: 14,
//   },
// });

export default AudioDenuncia;
