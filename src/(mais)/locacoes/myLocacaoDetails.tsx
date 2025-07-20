import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '@/components/Header';
import { Wrapper } from '@/components/Wrapper';
import { exibirDetalhes, DetalhesLocal, cancelarReserva } from '@/api/app/locacoes';
import { useAuth } from '@/providers';
import { useError } from '@/providers/ErrorProvider';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useThemeColor } from '@/hooks/useThemeColor';

const SalaoCard = () => {
    const route = useRoute();
    const navigation = useNavigation();
    // Espera receber o objeto reserva via params
    // @ts-ignore
    const reserva = route.params?.reserva;
    const [detalhes, setDetalhes] = useState<DetalhesLocal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const AuthContext = useAuth();
    const { setError } = useError();
    const confirm = useConfirmation();

    const background = useThemeColor({}, 'background');
    const background2 = useThemeColor({}, 'background2');
    const text2 = useThemeColor({}, 'text2');

    useEffect(() => {
        async function fetchDetalhes() {
            if (!reserva?.id && !reserva?.IDLOCAL) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const idLocal = reserva.IDLOCAL || reserva.id;
                const detalhesArr = await exibirDetalhes(idLocal);
                if (Array.isArray(detalhesArr) && detalhesArr.length > 0) {
                    setDetalhes(detalhesArr[0]);
                }
            } catch (e) {
                setDetalhes(null);
            }
            setIsLoading(false);
        }
        fetchDetalhes();
    }, [reserva]);

    const handleCancel = reserva?.STATUS === 'Cancelada' ? undefined : () => {
        confirm.showConfirmation('Cancelar Reserva', handleCancelConfirmation);
    };

    const handleCancelConfirmation = async () => {
        console.log("Reserva ",reserva);
        if (!reserva?.IDLOCACAO) return;
        try {
            const response = await cancelarReserva(reserva.IDLOCACAO);
            if (Array.isArray(response) && response[0]?.ERRO === false) {
                setError('Reserva cancelada com sucesso!', 'success');
                // Delay para dar tempo do teclado sumir
                setTimeout(() => {
                    // @ts-ignore
                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: '(tabs)' },
                            { name: '(locacoes)/List' }
                        ],
                    });
                }, 350);
            } else {
                setError(response[0]?.MSG_ERRO || 'Erro ao cancelar reserva', 'error');
            }
        } catch (error) {
            setError('Erro ao cancelar reserva', 'error');
        }
    };

    return (
        <>
            <Header title="Detalhes da Reserva" />
            <Wrapper
                style={[styles.container, { backgroundColor: background }]}
                isLoading={isLoading}
                primaryButtonLabel='Cancelar intenção'
                primaryColor='#FF3F3F'
                onPrimaryPress={handleCancel}
            >
                {!isLoading && (
                    <>
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{reserva?.tags?.[0]?.title || reserva?.STATUS}</Text>
                            </View>
                            <Text style={[styles.title, { color: text2 }]}>{reserva?.title || reserva?.LOCAL || detalhes?.DESCRICAO}</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: background2 }]}>
                            <View style={styles.row}>
                                <Text style={[styles.label, { color: '#6f7791' }]}>Associado</Text>
                                <Text style={[styles.value, { color: text2 }]}>{reserva?.associado ? reserva.associado : AuthContext.nome}</Text>
                            </View>
                            {(reserva?.subtitle || reserva?.DATA) && (
                                <View style={styles.row}>
                                    <Text style={[styles.label, { color: '#6f7791' }]}>Data da locação</Text>
                                    <Text style={[styles.value, { color: text2 }]}>{reserva?.subtitle || reserva?.DATA}</Text>
                                </View>
                            )}
                            {detalhes?.CAPACIDADE && (
                                <View style={styles.row}>
                                    <Text style={[styles.label, { color: '#6f7791' }]}>Capacidade</Text>
                                    <Text style={[styles.value, { color: text2 }]}>{detalhes.CAPACIDADE}</Text>
                                </View>
                            )}
                            {detalhes?.PRECO && (
                                <View style={styles.row}>
                                    <Text style={[styles.label, { color: '#6f7791' }]}>Custos</Text>
                                    <Text style={[styles.value, { color: text2 }]}>{detalhes.PRECO}</Text>
                                </View>
                            )}
                            {detalhes?.OBSERVACAO && (
                                detalhes.OBSERVACAO.length > 40 ? (
                                    <View style={styles.rowColumn}>
                                        <Text style={[styles.label, { color: '#6f7791' }]}>Observação</Text>
                                        <Text style={[styles.observacaoValueVertical, { color: text2 }]}>{detalhes.OBSERVACAO}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.row}>
                                        <Text style={[styles.label, { color: '#6f7791' }]}>Observação</Text>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={[styles.observacaoValue, { color: text2 }]}>{detalhes.OBSERVACAO}</Text>
                                        </View>
                                    </View>
                                )
                            )}
                        </View>
                    </>
                )}
            </Wrapper>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    statusBadge: {
        backgroundColor: '#339FFF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: 8,
    },
    statusText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '500',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    card: {
        borderRadius: 20,
        width: '100%',
        padding: 20,
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rowColumn: {
        flexDirection: 'column',
        marginTop: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 15,
    },
    value: {
        fontSize: 15,
        fontWeight: '500',
    },
    observacaoValue: {
        fontSize: 15,
        fontWeight: '500',
        flexWrap: 'wrap',
        flexShrink: 1,
        flex: 1,
        textAlign: 'right',
    },
    observacaoValueVertical: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'left',
    },
});

export default SalaoCard;
