import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useError } from '@/providers/ErrorProvider';
import { enviarAudio } from '@/api/app/ouvidoria';
import * as FileSystem from 'expo-file-system';
import { useConfirmation } from '@/providers/ConfirmProvider';

import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import { BottomSheet } from '@/components/BottomSheet';
import { useNavigation } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';

// Componente para o BottomSheet de gravação
const RecordingBottomSheet = ({
    isVisible,
    onClose,
    onRecordingComplete
}: {
    isVisible: boolean;
    onClose: () => void;
    onRecordingComplete: (uri: string) => void;
}) => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const MAX_RECORDING_DURATION = 90 * 1000; // 90 segundos em ms

    // Theme colors
    const sheetTitleColor = useThemeColor({}, 'text');
    const sheetDescColor = useThemeColor({}, 'text2');
    const progressBg = useThemeColor({}, 'background1');
    const progressBar = useThemeColor({}, 'brand');
    const progressText = useThemeColor({}, 'text2');
    const recordButtonBg = useThemeColor({}, 'brand');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(async () => {
                if (recording) {
                    const status = await recording.getStatusAsync();
                    setRecordingDuration(status.durationMillis || 0);
                    if ((status.durationMillis || 0) >= MAX_RECORDING_DURATION) {
                        await recording.stopAndUnloadAsync();
                        const uri = recording.getURI();
                        setIsRecording(false);
                        setRecording(null);
                        setRecordingDuration(0);
                        if (uri) {
                            onRecordingComplete(uri);
                            onClose();
                        }
                    }
                }
            }, 200);
        } else {
            setRecordingDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording, recording]);

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleRecordPress = async () => {
        try {
            if (isRecording) {
                // Parar gravação
                await recording?.stopAndUnloadAsync();
                const uri = recording?.getURI();
                setIsRecording(false);
                setRecording(null);
                setRecordingDuration(0);
                if (uri) {
                    onRecordingComplete(uri);
                    onClose();
                }
            } else {
                // Começar gravação
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY,
                );
                setRecording(recording);
                setIsRecording(true);
            }
        } catch (err) {
            console.error('Erro ao gravar áudio:', err);
            Alert.alert('Erro', 'Não foi possível iniciar a gravação de áudio.');
        }
    };

    if (!isVisible) return null;

    return (
        <BottomSheet
            visible={isVisible}
            onClose={onClose}
        >
            <View style={styles.bottomSheetContent}>
                <Text style={[styles.bottomSheetTitle, { color: sheetTitleColor }]}>Gravar áudio</Text>
                {!isRecording && <Text style={{ color: sheetDescColor, fontSize: 16, marginBottom: 20 }}>
                    Clique no botão abaixo para gravar um áudio de até 90 segundos e enviar à ouvidoria
                </Text>}
                {isRecording && (
                    <View style={{ marginTop: 16, width: '100%', marginBottom: 20 }}>
                        <View style={{ height: 6, backgroundColor: progressBg, borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                            <View style={{ width: `${(recordingDuration / MAX_RECORDING_DURATION) * 100}%`, height: 6, backgroundColor: progressBar }} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: progressText, fontSize: 12 }}>{formatTime(recordingDuration)}</Text>
                            <Text style={{ color: progressText, fontSize: 12 }}>{90}</Text>
                        </View>
                    </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={[styles.recordButton, { backgroundColor: recordButtonBg }]}
                        onPress={handleRecordPress}
                        disabled={isRecording && recordingDuration >= MAX_RECORDING_DURATION}
                    >
                        <IconSymbol
                            name={isRecording ? "square" : "microphone"}
                            size={20}
                            color="#FFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheet>
    );
};

export default function AudioClipComponent() {
    const [isChecked, setIsChecked] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showRecordingSheet, setShowRecordingSheet] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState<any>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const { setError } = useError();
    const navigation = useNavigation();
    const confirm = useConfirmation();

    // Theme colors
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const accent = useThemeColor({}, 'brand');
    const textColor = useThemeColor({}, 'text');
    const text2Color = useThemeColor({}, 'text2');
    const audioBoxBg = useThemeColor({}, 'background2');
    const audioBoxBorder = useThemeColor({}, 'background1');
    const playButtonBg = useThemeColor({}, 'brand');
    const audioTextColor = useThemeColor({}, 'brand');
    const progressBg = useThemeColor({}, 'background1');
    const progressBar = useThemeColor({}, 'brand');
    const checkboxBorder = useThemeColor({}, 'brand');
    const checkboxCheckedBg = useThemeColor({}, 'brand');
    const checkboxTextColor = useThemeColor({}, 'text');

    useEffect(() => {
        (async () => {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permissão negada', 'É necessário permitir o uso do microfone para gravar áudio.');
            }
        })();

        return () => {
            // Limpar o som quando o componente desmontar
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        if (sound) {
            sound.unloadAsync();
            setSound(null);
            setIsPlaying(false);
            setProgress(0);
            setDuration(0);
        }
    }, [audioUri]);

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Função para converter o arquivo de áudio em base64
    const getAudioBase64 = async (uri: string) => {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            return base64;
        } catch (err) {
            setError('Erro ao processar o áudio. Tente novamente.', 'error');
            return null;
        }
    };

    // Função para enviar o áudio
    const handleSubmit = async () => {
        if (!audioUri) {
            setError('Grave um áudio antes de enviar.', 'error');
            return;
        }
        try {
            const base64 = await getAudioBase64(audioUri);
            if (!base64) return;
            const response = await enviarAudio(base64);
            if (response.ERRO) {
                setError(response.MSG_ERRO || 'Erro ao enviar áudio.', 'error');
            } else {
                setError('Manifestação enviada com sucesso!', 'success');
                navigation.navigate("(tabs)");
            }
        } catch (err) {
            setError('Erro ao enviar áudio. Tente novamente.', 'error');
        }
    };

    const handlePlayPress = async () => {
        try {
            if (!audioUri) return;

            // Sempre descarrega o som anterior antes de criar um novo
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);
            setProgress(0);
            setDuration(0);

            newSound.setOnPlaybackStatusUpdate((status) => {
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
            console.error('Erro ao reproduzir áudio:', err);
            Alert.alert('Erro', 'Não foi possível reproduzir o áudio.');
        }
    };

    // Substituir onPrimaryPress do Wrapper para abrir o modal de confirmação
    return (
        <>
            <Header title="Manifestação via áudio" />
            <Wrapper
                style={[styles.container, { backgroundColor: background }]}
                primaryButtonLabel='Avançar'
                onPrimaryPress={() => confirm.showConfirmation('Confirmação', handleSubmit)}
                isPrimaryButtonDisabled={!audioUri}
            >
                <Text style={[styles.title, { color: accent }]}>CLIPE DE ÁUDIO</Text>

                {audioUri ? (
                    <>
                        <View style={[styles.audioBox, styles.playButton, { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: audioBoxBg, borderColor: audioBoxBorder }]}> 
                            <TouchableOpacity onPress={handlePlayPress} style={{ backgroundColor: playButtonBg, borderRadius: 40, paddingVertical: 10, paddingHorizontal: 13 }}>
                                <IconSymbol name={isPlaying ? "pause" : "play"} size={18} color="white" />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <View style={{ height: 6, backgroundColor: progressBg, borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                                    <View style={{ width: duration ? `${(progress / duration) * 100}%` : '0%', height: 6, backgroundColor: progressBar }} />
                                </View>
                            </View>
                        </View>
                        <Pressable onPress={() => setShowRecordingSheet(true)}>
                            <Text style={[styles.audioText, { textAlign: 'center', marginTop: 8, color: audioTextColor }]}>Gravar novamente</Text>
                        </Pressable>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.audioBox, { backgroundColor: audioBoxBg, borderColor: audioBoxBorder }]}
                        onPress={() => setShowRecordingSheet(true)}
                    >
                        <IconSymbol name="microphone" size={32} color={accent} />
                        <Text style={[styles.audioText, { color: audioTextColor }]}>Gravar Áudio</Text>
                    </TouchableOpacity>
                )}

                <Pressable
                    onPress={() => setIsChecked(!isChecked)}
                    style={styles.checkboxContainer}
                >
                    <View style={[styles.checkbox, { borderColor: checkboxBorder }, isChecked && { backgroundColor: checkboxCheckedBg }]}> 
                        {isChecked && <IconSymbol name="check" size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.checkboxText, { color: checkboxTextColor }]}>Eu autorizo que interessados tenham acesso a este registro, inclusive com meus dados pessoais.</Text>
                </Pressable>
            </Wrapper>

            <RecordingBottomSheet
                isVisible={showRecordingSheet}
                onClose={() => setShowRecordingSheet(false)}
                onRecordingComplete={(uri) => setAudioUri(uri)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    bottomSheetContent: {
        padding: 20,
    },
    bottomSheetTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    recordButtonText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    container: {
        padding: 20,
    },
    title: {
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 10,
    },
    audioBox: {
        borderRadius: 12,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 15,
        borderStyle: 'dashed',
        borderWidth: 1,
    },
    playButton: {
    },
    audioText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
    },
    checkboxText: {
        flex: 1,
        fontSize: 14,
    },
});