import Calendar from '@/components/Calendar';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper, WrapperRef } from '@/components/Wrapper';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Pressable, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { listarDisponibilidade, listarGaleria, reservar, DetalhesLocal, Disponibilidade, GaleriaImagem, exibirDetalhes } from '@/api/app/locacoes';
import ImageView from 'react-native-image-viewing';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useError } from '@/providers/ErrorProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BottomSheet } from '@/components/BottomSheet';

const LocacoesDetailsScreen = () => {
    const route = useRoute();
    // @ts-ignore
    const local: DetalhesLocal = route.params?.local;
    // Novos argumentos recebidos
    // @ts-ignore
    const termosUsoArg = route.params?.termosUso || '';
    // @ts-ignore
    const linkArquivoArg = route.params?.linkArquivo || '';
    // @ts-ignore
    const textoLinkArg = route.params?.textoLink || '';
    const [detalhes, setDetalhes] = useState<DetalhesLocal | null>(null);
    const [escala, setEscala] = useState<Disponibilidade[]>([]);
    const [horarios, setHorarios] = useState<{ HORARIO: string; ERRO: boolean }[]>([]);
    const [galeria, setGaleria] = useState<GaleriaImagem[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const confirm = useConfirmation();
    const { setError } = useError();
    const [aceito, setAceito] = useState(false);
    const [preco, setPreco] = useState<string | null>(null);
    const navigation = useNavigation();

    const [showToast, setShowToast] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    const [showToastErr, setShowToastErr] = useState(false);
    const [fadeAnimErr] = useState(new Animated.Value(0));

    const wrapperRef = useRef<WrapperRef>(null);

    // THEME COLORS
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const titleColor = useThemeColor({}, 'text');
    const subtitleColor = useThemeColor({}, 'text2');
    const accent = useThemeColor({}, 'brand');
    const checkboxBorder = useThemeColor({}, 'brand');
    const checkboxFill = useThemeColor({}, 'brand');
    const checkboxBg = useThemeColor({}, 'background1');
    const galleryBg = useThemeColor({}, 'background2');
    const galleryBorder = useThemeColor({}, 'background2');
    const galleryPlaceholder = useThemeColor({}, 'background2');
    const cardText = useThemeColor({}, 'text2');
    const cardTextBold = useThemeColor({}, 'text');
    const background2 = useThemeColor({}, "background2");
    const successBackgroundColor = useThemeColor({}, 'successBackground');
    const neutralBackground = useThemeColor({}, 'neutralBackground');
    const reversedTextColor = useThemeColor({}, 'reversedText');

    const [modalRegulations, setModalRegulations] = useState({ isOpen: false, toRegister: false, action: () => {} });
    const [agreeWithRegulation, setAgreeWithRegulation] = useState(false);
    const [isLoadingActivityDetails, setIsLoadingActivityDetails] = useState(false);
    const [isLoadingRequestActions, setIsLoadingRequestActions] = useState(false);
    const [regulation, setRegulation] = useState<string | null>(null);
    const [regulationLink, setRegulationLink] = useState<string | null>(null);
    const [regulationLinkText, setRegulationLinkText] = useState<string | null>(null);
    const textColor = useThemeColor({}, 'text');


    const showSuccessToast = () => {
        setShowToast(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setShowToast(false);
                wrapperRef.current?.scrollToBottom();
            });
            }, 2500);
        });
    };

    const showSuccessToastErr = () => {
        setShowToastErr(true);
        Animated.timing(fadeAnimErr, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
            Animated.timing(fadeAnimErr, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setShowToastErr(false);
            });
            }, 2500);
        });
    };

    useEffect(() => {
        async function fetchData() {
            if (!local) return;
            setLoading(true);
            try {
                // Busca detalhes do local (com preço)
                const detalhesArr = await exibirDetalhes(local.IDLOCAL);
                if (Array.isArray(detalhesArr) && detalhesArr.length > 0) {
                    setDetalhes(detalhesArr[0]);
                    setPreco(detalhesArr[0].PRECO);
                } else {
                    setDetalhes(null);
                    setPreco(null);
                }
                // Busca galeria
                const galeriaData = await listarGaleria(local.IDLOCAL);
                // Adiciona a capa como primeira imagem da galeria, se não estiver presente
                let galeriaComCapa = galeriaData;
                if (detalhesArr[0]?.CAPA) {
                    const capaLink = detalhesArr[0].CAPA;
                    const capaJaNaGaleria = galeriaData.some(img => img.LINK === capaLink);
                    if (!capaJaNaGaleria) {
                        galeriaComCapa = [{
                            LINK: capaLink,
                            IDIMAGEM: 0,
                            ORDEM: 0,
                            ERRO: false,
                            IDERRO: 0,
                            MSG_ERRO: ''
                        }, ...galeriaData];
                    }
                }
                setGaleria(galeriaComCapa);
                // Busca disponibilidade do mês atual
                const now = new Date();
                const disponibilidade = await listarDisponibilidade(local.IDLOCAL, now.getMonth() + 1, now.getFullYear());
                setEscala(disponibilidade.map(d => ({
                    ...d,
                    DATA: d.DIA.includes('/') ? `${d.DIA.split('/')[2]}-${d.DIA.split('/')[1].padStart(2, '0')}-${d.DIA.split('/')[0].padStart(2, '0')}` : d.DIA
                })));
                setSelectedDate(null);
                setHorarios([]);
            } catch (e) {
                setEscala([]);
                setHorarios([]);
                setGaleria([]);
                setDetalhes(null);
                setPreco(null);
            }
            setLoading(false);
        }
        fetchData();
    }, [local]);

    // Seleção de data: só permite datas disponíveis
    const handleDateSelect = async (data: string | string[] | null) => {
        if (!data || Array.isArray(data)) {
            setHorarios([]);
            setSelectedDate(null);
            return;
        }

        setSelectedDate(data);
        setLoading(true);
        try {
            // Não há endpoint de horários, só verifica se está reservado
            const dia = escala.find(e => {
                let d = e.DIA;
                if (d.includes('/')) {
                    const partes = d.split('/');
                    d = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                }
                return d === data;
            });
            if (dia && !dia.RESERVADO) {
                setHorarios([{ HORARIO: 'Dia inteiro', ERRO: false }]);
            } else {
                setHorarios([]);
            }
        } catch (e) {
            setHorarios([]);
        }
        setLoading(false);
    };

    // Dias disponíveis para o calendário (agora como datas completas YYYY-MM-DD)
    const diasDisponiveis = escala.map(e => {
        // e.DIA pode vir como '20/05/2025' ou '2025-05-20', normalizar para 'YYYY-MM-DD'
        let partes;
        if (e.DIA.includes('/')) {
            // formato 'DD/MM/YYYY'
            partes = e.DIA.split('/');
            return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
        } else if (e.DIA.includes('-')) {
            // formato 'YYYY-MM-DD'
            partes = e.DIA.split('-');
            if (partes[0].length === 4) {
                // já está no formato correto
                return e.DIA;
            } else {
                // formato 'DD-MM-YYYY'
                return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
        }
        return e.DIA;
    });

    // Monta array de imagens para o visualizador
    const images = galeria.map(img => ({ uri: img.LINK }));

    const openImageViewer = (index: number) => {
        setCurrentImageIndex(index);
        setVisible(true);
    };

    const openModalConfirmation = () => {
        confirm.showConfirmation('Confirmação', async () => {
            setLoading(true);

            try {
                const res = await reservar(local.IDLOCAL, selectedDate.split('-').reverse().join('/'));
                if (!res.ERRO) {
                    setError('Reserva realizada com sucesso!', 'success');
                    if (navigation && typeof navigation.goBack === 'function') {
                        navigation.goBack();
                    }
                } else {
                    setError(res.MSG_ERRO || 'Erro ao realizar reserva.', 'error');
                }
            } catch (e) {
                setError('Erro ao realizar reserva.', 'error');
            }
            setLoading(false);
        });
    }

    return (
        <>
            <Header title={detalhes?.DESCRICAO || 'Detalhes da Locação'} />
            <Wrapper
                ref={wrapperRef}
                primaryButtonLabel='Intenção de Reserva'
                onPrimaryPress={async () => {
                    if (!selectedDate) {
                        showSuccessToast();
                        return;
                    }

                    setAceito(false);
                    setModalRegulations({
                        isOpen: true,
                        toRegister: false,
                        action: async () => {
                            setModalRegulations({ isOpen: false, toRegister: false, action: () => {} });
                        }
                    });
                }}
                isLoading={loading}
                // isPrimaryButtonDisabled={!selectedDate}
            >
                {/* Imagem principal: capa do local */}
                {detalhes?.CAPA && (
                    <Image
                        style={{ width: '100%', height: 200, alignSelf: 'center' }}
                        source={{ uri: detalhes.CAPA }}
                    />
                )}
                <View style={[styles.container, { backgroundColor: background }]}> 
                    <Text style={[styles.title, { color: titleColor }]}>{detalhes?.DESCRICAO}</Text>
                    <View style={styles.capacityContainer}>
                        <Text style={[styles.subTitle, { color: subtitleColor }]}>
                        <IconSymbol color={subtitleColor} name={'people-roof'} size={14} /> {local.CAPACIDADE} pessoas
                        </Text>
                    </View>

                    <Text style={[styles.sectionTitle, { color: titleColor }]}>DESCRIÇÃO</Text>
                    <View style={[styles.card, { backgroundColor: cardBackground }]}> 
                        <Text style={[styles.text, { color: cardText }]}>{detalhes?.OBSERVACAO || 'Sem descrição.'}</Text>
                    </View>

                    <Text style={[styles.sectionTitle, { color: titleColor }]}>VALORES</Text>
                    <View style={[styles.card, { backgroundColor: cardBackground }]}> 
                        <Text style={[styles.bold, { color: cardTextBold }]}>Custos</Text>
                        <View style={styles.row}>
                            <Text style={[styles.text, { color: cardText }]}>Locação</Text>
                            <Text style={[styles.bold, { color: cardTextBold }]}>{preco ? `${preco}` : 'A consultar'}</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: titleColor }]}>Selecione a data em que deseja realizar sua reserva</Text>

                    <Calendar
                        diasIndisponiveis={diasDisponiveis}
                        multiplaSelecao={false}
                        onDiaSelecionado={handleDateSelect}
                        diasSelecionados={selectedDate ? [selectedDate] : []}
                        disablePastDays
                    />
                    <View style={[styles.card, styles.cardHorarios, styles.cardHorariosUnido, { backgroundColor: cardBackground }]}> 
                        {horarios.length === 0 || (horarios.length === 1 && horarios[0].ERRO) ? (
                            <></>
                        ) : (
                            <View style={styles.horariosRow}>
                                {horarios.map((h, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.horarioBtn,
                                            selectedDate && styles.horarioBtnSelecionado,
                                            { backgroundColor: selectedDate ? accent : cardBackground, borderColor: accent }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.text,
                                            selectedDate && styles.horarioTextSelecionado,
                                            { color: selectedDate ? '#fff' : cardText }
                                        ]}>{h.HORARIO}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {images.length > 0 && (
                        <Text style={[styles.sectionTitle, { color: titleColor }]}>GALERIA</Text>
                    )}
                    {images.length > 0 && (
                        <View style={styles.gridGallery}>
                            {images.map((image, idx) => (
                                <TouchableOpacity key={idx} style={[styles.imgPlaceholder, { backgroundColor: galleryBg, borderColor: galleryBorder }]} onPress={() => openImageViewer(idx)}>
                                    <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </Wrapper>
            {images.length > 0 && (
                <ImageView
                    images={images}
                    imageIndex={currentImageIndex}
                    visible={visible}
                    onRequestClose={() => setVisible(false)}
                    presentationStyle="overFullScreen"
                    animationType="fade"
                    backgroundColor="rgba(0, 0, 0, 0.9)"
                    swipeToCloseEnabled
                    doubleTapToZoomEnabled
                />
            )}

            <BottomSheet
                visible={modalRegulations.isOpen}
                onClose={() => setModalRegulations({ isOpen: false, toRegister: false, action: () => {} })}
                primaryButtonLabel={modalRegulations.isOpen ? 'Continuar' : 'Fechar'}
                onPrimaryPress={() => {
                    setModalRegulations({ isOpen: false, toRegister: true, action: () => {} });
                }}
            >
                <Text style={[styles.modalTitle, { color: textColor }]}>Confirmação</Text>
                <View key="info" style={{ marginBottom: 16, justifyContent:'space-between' }}>
                    <View style={{ flexDirection: 'row',justifyContent:'space-between' }} >
                        <Text style={{ fontSize: 18, marginBottom: 8, color: titleColor }}>Data da locação: </Text>
                        <Text style={{ fontSize: 18, marginBottom: 8, color: titleColor }}>{selectedDate}</Text>
                    </View>
                    <View style={{ flexDirection: 'row',justifyContent:'space-between' }} >
                        <Text style={{ fontSize: 18, color: titleColor }}>Custos: </Text>
                        <Text style={{ fontSize: 18, color: titleColor }}>{preco ? `${preco}` : 'A consultar'}</Text>
                    </View>
                </View>
            </BottomSheet>

            <BottomSheet
                visible={modalRegulations.toRegister}
                onClose={() => setModalRegulations({ isOpen: false, toRegister: false, action: () => {} })}
                primaryButtonLabel={modalRegulations.toRegister ? 'Continuar' : 'Fechar'}
                onPrimaryPress={() => {
                    if (modalRegulations.toRegister) {
                        if (!agreeWithRegulation) {
                            showSuccessToastErr()
                            return;
                        }
                        setAgreeWithRegulation(false);
                        setModalRegulations({ isOpen: false, toRegister: false, action: () => {} });
                        openModalConfirmation();
                    } else {
                        setModalRegulations({ isOpen: false, toRegister: false, action: () => {} });
                    }
                }}
            >
                <View key="info" style={{ marginBottom: 16, justifyContent:'space-between' }}>
                    <Text style={[styles.modalTitle, { color: textColor }]}>Termo de uso</Text>
                    <ScrollView style={{ marginBottom: 12, maxHeight: 200 }}>
                        <Text style={[styles.modalText, { color: "#878da3" }]}>{termosUsoArg || 'Nenhum termo de uso disponível para a data selecionada.'}</Text>
                        {/* Visualização de link, igual ao transfer */}
                        {linkArquivoArg ? (
                            <TouchableOpacity
                                style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => {
                                    if (linkArquivoArg) {
                                        if (typeof window !== 'undefined' && window.open) {
                                            window.open(linkArquivoArg, '_blank');
                                        } else {
                                            // @ts-ignore
                                            import('react-native').then(RN => RN.Linking.openURL(linkArquivoArg));
                                        }
                                    }
                                }}
                            >
                                <IconSymbol
                                    size={15}
                                    name="file-text"
                                    library="fontawesome"
                                    color="#D03481"
                                />
                                <Text style={{ color: '#D03481', fontWeight: 'bold', marginLeft: 8 }}>
                                    {textoLinkArg || 'Abrir Regulamento Completo'}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </ScrollView>
                    {modalRegulations.toRegister && (
                        <View style={styles.checkboxRow}>
                            <Pressable
                                onPress={() => setAgreeWithRegulation((prev) => !prev)}
                                style={[
                                    styles.fakeCheckbox,
                                    agreeWithRegulation && styles.checkedBox,
                                ]}
                            >
                                {agreeWithRegulation && (
                                    <Text style={{ color: "#fff" }}>✓</Text>
                                )}
                            </Pressable>
                            <Text style={[styles.checkboxLabel, { color: textColor }]}>Eu li e concordo com os termos e condições</Text>
                        </View>
                    )}
                </View>
            </BottomSheet>


            {showToast && (
                <Animated.View style={[styles.toast, { opacity: fadeAnim, backgroundColor: successBackgroundColor }]}>
                    <Text style={[styles.toastTitle, { color: reversedTextColor }]}>⚠️ Atenção</Text>
                    <Text style={[styles.toastMessage, { color: reversedTextColor }]}>Você precisa selecionar uma data no calendário antes de prosseguir.</Text>
                </Animated.View>
            )}
            {showToastErr && (
                <Animated.View style={[styles.toast, { opacity: fadeAnimErr, backgroundColor: successBackgroundColor }]}>
                    <Text style={[styles.toastTitle, { color: reversedTextColor }]}>⚠️ Atenção</Text>
                    <Text style={[styles.toastMessage, { color: reversedTextColor }]}>Você precisa aceitar os termos e condições.</Text>
                </Animated.View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2E7F8',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 600,
        color: '#0F1C47',
        textAlign: 'center',
    },
    capacityContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    subTitle: {
        display: 'flex',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 500,
        color: '#0F1C4799',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        marginTop: 20,
        marginBottom: 8,
        fontWeight: 400,
        color: '#0F1C4799',
        fontSize: 13,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginTop: 0,
        marginBottom: 10,
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
        borderColor: '#8EA5FF',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    horarioBtnSelecionado: {
        backgroundColor: '#8EA5FF',
    },
    horarioTextSelecionado: {
        color: '#fff',
        fontWeight: 'bold',
    },
    text: {
        color: '#0F1C4799',
    },
    bold: {
        fontWeight: 'bold',
        color: '#1B2B64',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
    },
    dia: {
        width: 40,
        height: 40,
        margin: 4,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    diaTexto: {
        color: '#1B2B64',
    },
    default: {
        backgroundColor: '#fff',
    },
    disponivel: {
        backgroundColor: '#D4F4DD',
    },
    indisponivel: {
        backgroundColor: '#DDD',
    },
    selecionado: {
        backgroundColor: '#8EA5FF',
    },
    legend: {
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'center',
    },
    gridGallery: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    imgPlaceholder: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: '#ccc',
        margin: '1.5%',
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        elevation: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    fakeCheckbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#D53F8C',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    checkedBox: {
        backgroundColor: '#D53F8C',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#fff',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    toast: {
        position: 'absolute',
        top: 90,
        left: 16,
        right: 16,
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
    },
    toastMessage: {
        fontSize: 13,
        marginTop: 4,
    },
});

export default LocacoesDetailsScreen;
