import Header from '@/components/Header';
import { Wrapper } from '@/components/Wrapper';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useError } from '@/providers/ErrorProvider';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { verificarTiquete, validarTiquete } from '@/api/app/financeiro';
import { useAuth } from '@/providers/AuthProvider';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TicketConfirm() {
    const route = useRoute();
    const navigation = useNavigation();
    const confirm = useConfirmation();
    const { user } = useAuth();
    const { setError } = useError();
    // @ts-ignore
    const barcode = route.params?.barcode || '';
    const [isLoading, setIsLoading] = useState(true);
    const [ticketInfo, setTicketInfo] = useState<any>(null);

    const background = useThemeColor({}, 'background');
    const background2 = useThemeColor({}, 'background2');
    const text = useThemeColor({}, 'text');
    const text2 = useThemeColor({}, 'text2');

    useEffect(() => {
        const fetchTicket = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await verificarTiquete(barcode);
                if (res.ERRO) {
                    setError(res.MSG_ERRO || res.MENSAGEM || 'Ticket inválido', 'error');
                    setTicketInfo(null);
                    navigation.goBack();
                } else {
                    console.log('Ticket Info:', res);
                    setTicketInfo(res);
                }
            } catch (e: any) {
                setError('Erro ao verificar ticket', 'error');
                setTicketInfo(null);
                setTimeout(() => {
                    navigation.goBack();
                }, 2000);
            }
            setIsLoading(false);
        };
        fetchTicket();
    }, [barcode]);

    const handleConfirm = () => {
        confirm.showConfirmation('Confirmar Ticket', async () => {
            setIsLoading(true);
            try {
                // Valor fixo, pode ser ajustado se necessário
                const valor = ticketInfo?.VALOR;
                const res = await validarTiquete(barcode, valor);
                console.log('Validar Ticket Response:', res);
                if (res.ERRO) {
                    setError(res.MSG_ERRO || res.MENSAGEM || 'Erro ao validar ticket', 'error');
                    navigation.goBack();
                } else {
                    setError('Pagamento realizado com sucesso!', 'success', 3000, 'Válido por 12h a contar do horário de entrada. Após este período validar o ticket novamente.');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: '(tabs)' }, { name: '(tabs)/ticket' }],
                    });
                }
            } catch (e: any) {
                setError('Erro ao validar ticket', 'error');
                setTimeout(() => {
                    navigation.goBack();
                }, 2000);
            }
            setIsLoading(false);
        }, {
            abovePasswordComponent: (
                <View style={{ padding: 16 }}>
                    <Text style={{ color: '#6f7791', fontSize: 16, fontWeight: '500', marginBottom: 16 }}>
                        Pagamento de Estacionamento
                    </Text>
                    <Text style={{ color: text2, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
                        R$ {ticketInfo?.VALOR}
                    </Text>
                </View>
            )
        })
    };

    // Função utilitária para extrair data e horário de uma string no formato "27/05/2025 07:00:00"
    function parseDataHora(dataHoraStr?: string) {
        if (!dataHoraStr) return { data: '-', hora: '-' };
        const [data, horaCompleta] = dataHoraStr.split(' ');
        const hora = horaCompleta ? horaCompleta.slice(0,5) : '-';
        return { data, hora };
    }
    const { data: dataFormatada, hora: horaFormatada } = parseDataHora(ticketInfo?.DATA);

    return (
        <>
            <Header title="Ticket" />
            <Wrapper
                style={[styles.container, { backgroundColor: background }]}
                primaryButtonLabel='Confirmar'
                onPrimaryPress={handleConfirm}
                isLoading={isLoading}
            >
                {(
                    <>
                        <Text style={[styles.infoText, { color: text2 }]}>
                            Confira abaixo as informações sobre o seu ticket.
                        </Text>
                        <View style={[styles.card, { backgroundColor: background2, shadowColor: text2 }]}>
                            <Text style={[styles.cardTitle, { color: text2 }]}>Ticket de Estacionamento</Text>
                            <View style={styles.barcode}>
                                <Image source={require('@/assets/images/barcode.webp')} style={{ width: '100%', height: 80, marginBottom: 8, tintColor: text2 }} resizeMode="contain" />
                            </View>
                            <View style={styles.row}>
                                <Text style={[styles.label, { color: '#6f7791' }]}>Código</Text>
                                <Text style={[styles.value, { color: text2 }]}>{barcode}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={[styles.label, { color: '#6f7791' }]}>Status</Text>
                                <Text style={[styles.value, { color: text2 }]}>{ticketInfo?.MENSAGEM || 'Válido'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={[styles.label, { color: '#6f7791' }]}>Data</Text>
                                <Text style={[styles.value, { color: text2 }]}>{dataFormatada}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={[styles.label, { color: '#6f7791' }]}>Horário</Text>
                                <Text style={[styles.value, { color: text2 }]}>{horaFormatada}</Text>
                            </View>
                            <View style={styles.rowBottom}>
                                <Text style={[styles.payLabel, { color: text2 }]}>Valor a pagar</Text>
                                <Text style={[styles.payValue, { color: text2 }]}>R$ {ticketInfo?.VALOR}</Text>
                            </View>
                        </View>
                    </>
                )}
            </Wrapper>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    infoText: {
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 24,
        marginTop: 8,
    },
    card: {
        borderRadius: 28,
        padding: 28,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 24,
    },
    barcode: {
        alignItems: 'center',
        marginBottom: 32,
    },
    barcodeLines: {
        width: 220,
        height: 48,
        borderRadius: 4,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '400',
    },
    value: {
        fontSize: 15,
        fontWeight: '400',
    },
    rowBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
    },
    payLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    payValue: {
        fontSize: 18,
        fontWeight: '700',
    },
});