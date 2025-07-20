// VisitForm.tsx
import Calendar from '@/components/Calendar';
import Header from '@/components/Header';
import { Wrapper } from '@/components/Wrapper';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { gravarConvites, exibirInformacao } from '@/api/app/convites';
import { useError } from '@/providers/ErrorProvider';
import { useNavigation } from '@react-navigation/native';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useThemeColor } from '@/hooks/useThemeColor';

const VisitForm = () => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [visitorCount, setVisitorCount] = useState(1);
    const [selectedDate, setSelectedDate] = useState<{ dia?: number; dias?: number[]; mes: number; ano: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [infoText, setInfoText] = useState<string>('');
    const [loadingInfo, setLoadingInfo] = useState<boolean>(true);
    const { setError } = useError();
    const navigation = useNavigation();
    const confirm = useConfirmation();

    // Theme colors
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const textColor = useThemeColor({}, 'text');
    const text2Color = useThemeColor({}, 'text2');
    const labelColor = useThemeColor({}, 'text');
    const inputBg = useThemeColor({}, 'background2');
    const inputText = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'background1');
    const accent = useThemeColor({}, 'brand');
    const fadedText = useThemeColor({}, 'text2');

    useEffect(() => {
        let mounted = true;
        setLoadingInfo(true);
        exibirInformacao().then(res => {
            if (mounted && res && res[0] && !res[0].ERRO) {
                setInfoText(res[0].INFORMACAO.replace(/\r?\n/g, ' '));
            }
        }).catch(() => {
            if (mounted) setInfoText('');
        }).finally(() => {
            if (mounted) setLoadingInfo(false);
        });
        return () => { mounted = false; };
    }, []);

    return (
        <>
            <Header title='Novo Convite' />
            <Wrapper
                style={[styles.container, { backgroundColor: background }]}
                onPrimaryPress={async () => {
                    const dia = selectedDate?.dia ?? (selectedDate?.dias && selectedDate.dias[0]);
                    if (!selectedDate || !dia) {
                        setError('Selecione uma data para o convite!', 'error');
                        return;
                    }
                    const dataStr = `${dia.toString().padStart(2, '0')}/${selectedDate.mes.toString().padStart(2, '0')}/${selectedDate.ano}`;
                    confirm.showConfirmation('Confirmar convite', async () => {
                        setIsSubmitting(true);
                        try {
                            const response = await gravarConvites({
                                QUANTIDADE: visitorCount,
                                DATA: dataStr,
                            });
                            if (response[0]?.ERRO) {
                                setError(response[0]?.MSG_ERRO || 'Erro ao criar convite.', 'error');
                            } else {
                                setError('Convite criado com sucesso!', 'success');
                                // @ts-ignore
                                navigation.reset({
                                    index: 1,
                                    routes: [
                                        // @ts-ignore
                                        { name: '(tabs)' },
                                        // @ts-ignore
                                        { name: '(invites)/list' }
                                    ]
                                });
                            }
                        } catch (e) {
                            setError('Erro ao criar convite.', 'error');
                        } finally {
                            setIsSubmitting(false);
                        }
                    }, {
                        abovePasswordComponent: (
                            <View style={{ padding: 16 }}>
                                <Text style={{ color: fadedText, fontSize: 16, fontWeight: '500', marginBottom: 16 }}>
                                    CONFIRMAR CONVITE
                                </Text>
                                <Text style={{ color: accent, fontSize: 19, fontWeight: '700', marginBottom: 16 }}>
                                    {dataStr}
                                </Text>
                            </View>
                        )
                    });
                }}
                primaryButtonLabel='Criar convite'
                isPrimaryButtonDisabled={isSubmitting}
                isLoading={loadingInfo || isSubmitting}
            >
                <Text style={[styles.description, { color: textColor }]}> 
                    {infoText && (
                        showFullDescription
                            ? infoText
                            : <>
                                {infoText.length > 100 ? `${infoText.slice(0, 100)}...` : infoText}
                                {infoText.length > 100 && (
                                    <Text style={[styles.link, { color: accent }]} onPress={() => setShowFullDescription(true)}> Ver mais</Text>
                                )}
                            </>
                    )}
                </Text>

                <Text style={[styles.label, { color: labelColor }]}>NÚMERO DE VISITANTES</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: inputBg, borderRadius: 12 }}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        borderWidth: 1,
                        borderColor: borderColor,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: 48, // altura consistente com outros inputs
                        backgroundColor: inputBg,
                    }}>
                        <TextInput
                            style={[styles.input, {
                                flex: 1,
                                marginBottom: 0,
                                color: inputText,
                                borderWidth: 0,
                                paddingLeft: 0,
                                backgroundColor: 'transparent',
                            }]}
                            keyboardType="numeric"
                            value={visitorCount.toString()}
                            onChangeText={text => {
                                const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                                setVisitorCount(isNaN(num) ? 1 : Math.max(1, num));
                            }}
                            maxLength={2}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => setVisitorCount((prev) => Math.max(1, prev - 1))}
                                style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={{ fontSize: 20, color: textColor }}>-</Text>
                            </TouchableOpacity>
                            <View style={{ width: 1, height: 20, backgroundColor: borderColor, marginHorizontal: 4 }} />
                            <TouchableOpacity
                                onPress={() => setVisitorCount((prev) => prev + 1)}
                                style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={{ fontSize: 20, color: textColor }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Text style={[styles.label, { color: labelColor }]}>DATA DA VISITA</Text>

                {(() => {
                    const today = new Date();
                    const anoAtual = today.getFullYear();
                    const mesAtual = String(today.getMonth() + 1).padStart(2, '0');

                    // Função adaptadora para converter o retorno do Calendar
                    function handleDiaSelecionado(data: string | string[] | null) {
                        if (!data) {
                            setSelectedDate(null);
                            return;
                        }
                        if (Array.isArray(data)) {
                            // multiplaSelecao
                            const dias = data.map(d => parseInt(d.split('-')[2], 10));
                            setSelectedDate({ dias, mes: parseInt(mesAtual, 10), ano: anoAtual });
                        } else {
                            // seleção única
                            const dia = parseInt(data.split('-')[2], 10);
                            setSelectedDate({ dia, mes: parseInt(mesAtual, 10), ano: anoAtual });
                        }
                    }

                    return (
                        <Calendar
                            onDiaSelecionado={handleDiaSelecionado}
                            disablePastDays
                        />
                    );
                })()}

                <Text style={[styles.footerNote, { color: fadedText }]}>O convite é válido apenas no dia escolhido</Text>
            </Wrapper>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#E2E7F8', // replaced by theme
        padding: 20,
        flexGrow: 1,
    },
    description: {
        // color: '#1B1B1F', // replaced by theme
        fontSize: 14,
        marginBottom: 24,
    },
    link: {
        textDecorationLine: 'underline',
        // color: '#1B1B1F', // replaced by theme
        fontWeight: '600',
    },
    label: {
        // color: '#1B1B1F', // replaced by theme
        fontSize: 12,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    input: {
        borderRadius: 12,
        // color: '#fff', // replaced by theme
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        fontSize: 16,
    },
    calendarText: {
        // color: '#888', // replaced by theme if needed
    },
    footerNote: {
        // color: '#1B1B1F', // replaced by theme
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
    },
});

export default VisitForm;
