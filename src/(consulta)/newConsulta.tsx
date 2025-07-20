import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { AssociadosList } from '@/components/AssociadosList';
import Calendar from '@/components/Calendar';
import { useRoute, useNavigation } from '@react-navigation/native';
import { listarEscala, listarHorarios, gravarHorario, listarEspecialistas } from '@/api/app/consultas';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useError } from '@/providers/ErrorProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';

export default function NewConsulta() {
    const route = useRoute();
    const navigation = useNavigation();
    const { setError } = useError();
    const confirm = useConfirmation();
    const especialistaObj = route.params?.especialista;
    const idEspecialista = especialistaObj?.id;
    const iconEspecialista = especialistaObj?.icon;

    const iconText = useThemeColor({}, 'iconText');
    const background1 = useThemeColor({}, 'background1');
    const text2 = useThemeColor({}, 'text2');
    const tertiaryText = useThemeColor({}, 'tertiaryText');
    const brand = useThemeColor({}, 'brand');
    const text = useThemeColor({}, 'text');
    const highlight = useThemeColor({}, 'highlight');
    const highlightFaded = useThemeColor({}, 'highlightFaded');
    const background2 = useThemeColor({}, 'background2');
    const neutralTextDark = useThemeColor({}, 'neutralTextDark');
    const overlayBackground = useThemeColor({}, 'overlayBackground');

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [horarios, setHorarios] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [diasDisponiveis, setDiasDisponiveis] = useState<string[]>([]);
    const [selectedAssociado, setSelectedAssociado] = useState<any>(null);
    const [selectedHorario, setSelectedHorario] = useState<string | null>(null);
    const [isPrimaryButtonDisabled, setIsPrimaryButtonDisabled] = useState(true);
    const [chaveHorario, setChaveHorario] = useState<string | null>(null);
    const [aceito, setAceito] = useState(false);
    const [especialidade, setEspecialidade] = useState<string>('');
    const [especialista, setEspecialista] = useState<string>('');
    const [loadingEspecialista, setLoadingEspecialista] = useState(true);
    const [valorHorario, setValorHorario] = useState<number | undefined>(undefined);
    const [showRegulamento, setShowRegulamento] = useState(false);
    const [regulamento, setRegulamento] = useState<string>('');

    useEffect(() => {
        console.log('idEspecialista:', idEspecialista);
    }, [idEspecialista]);

    useEffect(() => {
        async function fetchEspecialista() {
            if (!idEspecialista) {
                setLoadingEspecialista(false);
                return;
            }
            setLoadingEspecialista(true);
            try {
                const especialistas = await listarEspecialistas();
                const found = especialistas.find(e => e.IDESPECIALISTA === Number(idEspecialista));
                if (found) {
                    setEspecialidade(found.ESPECIALIDADE);
                    setEspecialista(found.ESPECIALISTA);
                    setRegulamento(found.REGULAMENTO || '');
                } else {
                    setEspecialidade('');
                    setEspecialista('');
                    setRegulamento('');
                }
            } catch (e) {
                setEspecialidade('');
                setEspecialista('');
                setRegulamento('');
            }
            setLoadingEspecialista(false);
        }
        fetchEspecialista();
    }, [idEspecialista]);

    const handleSelectAssociado = async (associado: any) => {
        setSelectedAssociado(associado);
        setSelectedDate(null);
        setHorarios([]);
        setSelectedHorario(null);
        setIsPrimaryButtonDisabled(true);
        if (!idEspecialista || !associado || !associado.TITULO) {
            console.log('handleSelectAssociado: idEspecialista ou associado.TITULO ausente', { idEspecialista, associado });
            return;
        }
        setLoading(true);
        try {
            const escala = await listarEscala(associado.TITULO, Number(idEspecialista));
            console.log('handleSelectAssociado: escala recebida', escala);
            const dias = escala.filter(e => !e.ERRO).map(e => {
                const [dia, mes, ano] = e.DATA.split('/');
                return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            });
            console.log('handleSelectAssociado: dias convertidos', dias);
            setDiasDisponiveis(dias);
        } catch (e) {
            console.log('handleSelectAssociado: erro ao buscar escala', e);
            setDiasDisponiveis([]);
        }
        setLoading(false);
    };

    const handleDateSelect = async (data: string | string[] | null) => {
        console.log('handleDateSelect: data recebida', data);
        setSelectedHorario(null);
        setIsPrimaryButtonDisabled(true);
        if (!data || Array.isArray(data) || !selectedAssociado || !selectedAssociado.TITULO) {
            setHorarios([]);
            setSelectedDate(null);
            return;
        }
        setSelectedDate(data);
        setLoading(true);
        try {
            const [ano, mes, dia] = data.split('-');
            const dataBR = `${dia}/${mes}/${ano}`;
            const horariosApi = await listarHorarios(Number(idEspecialista), dataBR);
            setHorarios(horariosApi.filter(h => !h.ERRO).map(h => h.HORARIO));
            if (horariosApi.length > 0) {
                setValorHorario(horariosApi[0].VALOR);
            } else {
                setValorHorario(undefined);
            }
        } catch (e) {
            setHorarios([]);
            setValorHorario(undefined);
        }
        setLoading(false);
    };

    const handleSelectHorario = (horario: string) => {
        setSelectedHorario(horario);
        setIsPrimaryButtonDisabled(false);
        setChaveHorario(horario);
    };

    const handleContinuar = () => {
        if (!selectedHorario || !chaveHorario || !selectedAssociado || !selectedDate) return;
        navigation.navigate('ConsultaResumo' as never, {
            especialista,
            especialidade,
            selectedAssociado,
            selectedDate,
            selectedHorario,
            chaveHorario,
            idEspecialista,
            valorHorario,
            regulamento, // Passa o regulamento
            iconEspecialista // Passa o ícone do especialista
        } as never);
    };

    return (
        <>
            <Header title='Nova consulta' />
            <Wrapper
                style={{ padding: 16 }}
                isLoading={loadingEspecialista}
                isPrimaryButtonDisabled={isPrimaryButtonDisabled}
                primaryButtonLabel='Continuar'
                onPrimaryPress={selectedHorario ? handleContinuar : undefined}
            >
                <View style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: background1 }]}>
                        <IconSymbol
                            color={iconText}
                            name={iconEspecialista || "hands"}
                            library='fontawesome'
                            size={40}
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: text2 }]}>{especialidade || 'Especialidade'}</Text>
                        <Text style={[styles.subtitle, { color: tertiaryText }]}>{especialista || 'Especialista'}</Text>
                        <TouchableOpacity style={styles.linkContainer} onPress={() => setShowRegulamento(true)}>
                            <Text style={[styles.linkText, { color: brand }]}>Informações</Text>
                            <IconSymbol color={brand} name={"file-lines"} library='fontawesome' size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
                <AssociadosList
                    onSelect={handleSelectAssociado}
                    selectedAssociado={selectedAssociado}
                    showTodos={false}
                    titulo='Selecione o associado'
                    returnObject={true}
                />
                <Text style={[styles.sectionTitle, { color: text }]}>Escolha a data</Text>
                <View style={{ position: 'relative' }}>
                    <Calendar
                        diasDisponiveis={diasDisponiveis}
                        multiplaSelecao={false}
                        diasIndisponiveis={[]}
                        onDiaSelecionado={handleDateSelect}
                        diasSelecionados={selectedDate ? [selectedDate] : []}
                        blocked
                    />
                    {loading && (
                        <View style={[styles.loadingOverlay, { backgroundColor: overlayBackground }]}>
                            <ActivityIndicator size="large" color={highlight} />
                        </View>
                    )}
                </View>
                <View style={[styles.card, styles.cardHorarios, styles.cardHorariosUnido]}>
                    {/* Label acima dos horários alinhada à esquerda */}
                    <Text style={{ fontSize: 13, color: '#0F1C47CC', marginBottom: 4 }}>ESCOLHA O HORÁRIO</Text>
                    {horarios.length === 0 ? (
                        <Text style={[styles.text, { color: neutralTextDark }]}>{'Nenhum horário disponível para a data selecionada.'}</Text>
                    ) : (
                        <View style={styles.horariosRow}>
                            {horarios.map((h, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.horarioBtn,
                                        { borderColor: highlight, backgroundColor: background2 },
                                        selectedHorario === h && { backgroundColor: highlightFaded, borderColor: text2 }
                                    ]}
                                    onPress={() => handleSelectHorario(h)}
                                >
                                    <Text style={[styles.text, { color: neutralTextDark }]}>{h}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </Wrapper>
            {/* Bottom sheet/modal para regulamento */}
            <Modal
                visible={showRegulamento}
                animationType="slide"
                transparent
                onRequestClose={() => setShowRegulamento(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Informações</Text>
                        <ScrollView style={{ maxHeight: 350 }}>
                            <Text style={{ fontSize: 15, color: '#333' }}>{regulamento ? regulamento : 'Nenhum regulamento disponível.'}</Text>
                        </ScrollView>
                        <TouchableOpacity 
                          style={{ 
                            marginTop: 24, 
                            alignSelf: 'center', 
                            backgroundColor: '#DA1984',
                            borderRadius: 16, 
                            paddingHorizontal: 32, 
                            paddingVertical: 10,
                            width: '100%', // ocupa toda a largura do modal
                          }} 
                          onPress={() => setShowRegulamento(false)}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'column',
        alignItems: 'baseline',
        width: '100%',
        marginVertical: 8,
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 15,
        opacity: 0.7,
        marginBottom: 8,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    linkText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    sectionTitle: {
        marginTop: 20,
        marginBottom: 8,
        fontSize: 13,
        fontWeight: '400',
        textTransform: 'uppercase',
    },
    cardHorarios: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        marginTop: 0,
    },
    cardHorariosUnido: {
        marginTop: -10,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        paddingTop: 20,
    },
    horariosRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    horarioBtn: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});