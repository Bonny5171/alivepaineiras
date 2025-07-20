import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Wrapper } from '@/components/Wrapper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet, View, Modal, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useError } from '@/providers/ErrorProvider';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { cancelarConsulta, exibirConsulta, ExibirConsultaResponse } from '@/api/app/appointments';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';

const AppointmentDetail: React.FC = () => {
    // Defina o tipo esperado para os params
    type ConsultaParams = { CONSULTA: { IDCONSULTA: number } };
    const navigation = useNavigation();
    const route = useRoute();
    const params = route.params as ConsultaParams;
    const [consulta, setConsulta] = useState<ExibirConsultaResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { setError } = useError();
    const confirm = useConfirmation();
    const [showRegulamento, setShowRegulamento] = useState(false);

    const background = useThemeColor({}, 'background');
    const background2 = useThemeColor({}, 'background2');
    const text = useThemeColor({}, 'text');
    const text2 = useThemeColor({}, 'text2');

    useEffect(() => {
        console.log('params:', params); // log params
        setIsLoading(true); // Inicia o carregamento

        // Agora acessa corretamente o IDCONSULTA
        const IDCONSULTA = params?.CONSULTA?.IDCONSULTA ? Number(params.CONSULTA.IDCONSULTA) : null;

        if (IDCONSULTA === null) {
            setError('ID da consulta não encontrado', 'error');
            setIsLoading(false);
            return;
        }

        exibirConsulta(IDCONSULTA)
            .then((response) => {
                setConsulta(response[0]);
            })
            .catch((error) => {
                console.error('Erro ao buscar dados:', error);
                setError('Erro ao carregar detalhes da consulta', 'error');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [params, setError]);

    const handleCancel = () => {
        confirm.showConfirmation('Cancelar Consulta', handleCancelConfirmation);
    };

    const handleCancelConfirmation = async () => {
        if (!consulta) return;

        try {
            const IDCONSULTA = params?.CONSULTA?.IDCONSULTA ? Number(params.CONSULTA.IDCONSULTA) : null;
            if (IDCONSULTA === null) {
                setError('ID da consulta não encontrado', 'error');
                return;
            }
            await cancelarConsulta(IDCONSULTA);
            setError('Consulta cancelada com sucesso!', 'success');
            //@ts-ignore
            navigation.reset({
                index: 1,
                routes: [
                    { name: '(tabs)' },
                    { name: '(consulta)/index' }
                ],
            });
        } catch (error) {
            setError('Erro ao cancelar consulta', 'error');
            console.error('Erro ao cancelar consulta:', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
            padding: 16,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        infoContainer: {
            width: '100%',
            backgroundColor: background2,
            padding: 16,
            borderRadius: 16,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
            backgroundColor: background2,
        },
        infoLabel: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: 'bold',
            backgroundColor: background2,
        },
        infoValue: {
            fontSize: 14,
            lineHeight: 20,
            backgroundColor: background2,
        },
    });

    // Extrai o ícone da consulta original (params.CONSULTA) se existir
    let iconName: any = 'arm-flex';
    if (route && typeof route.params === 'object' && route.params && 'CONSULTA' in route.params) {
        const consultaParam = (route.params as any).CONSULTA;
        if (consultaParam && typeof consultaParam.ICONE === 'string' && consultaParam.ICONE) {
            iconName = consultaParam.ICONE.replace('fa-', '').replace('mdi-', '');
        }
    }

    return (
        <Wrapper
            isLoading={isLoading}
            secondaryButtonLabel={consulta?.CANCELAR ? 'Cancelar Consulta' : undefined}
            onSecondaryPress={consulta?.CANCELAR ? handleCancel : undefined}
        >
            <Header title='Saúde' />
            <View style={[styles.container, { backgroundColor: background }]}>
                {consulta && (
                    <>
                        {/* Ícone grande centralizado usando o campo ICONE se vier via params.CONSULTA, senão fallback */}
                        <View style={{ width: 120, height: 120, borderRadius: 32, backgroundColor: background2, alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 8 }}>
                            <IconSymbol
                                name={iconName as any}
                                size={56}
                                color={text}
                            />
                        </View>
                        {/* Título e subtítulo */}
                        <ThemedText style={{ fontSize: 20, fontWeight: '600', color: text2, textAlign: 'center', marginBottom: 2 }}>{consulta.TITULO}</ThemedText>
                        <ThemedText style={{ fontSize: 15, color: '#636d8e', textAlign: 'center', marginBottom: 12 }}>{consulta.ESPECIALISTA}</ThemedText>
                        {/* Regulamento Interno */}
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 8 }} onPress={() => setShowRegulamento(true)}>
                            <ThemedText style={{ color: '#DA1984', fontWeight: '600', fontSize: 15 }}>Informações</ThemedText>
                            <IconSymbol name="file-lines" size={20} color="#DA1984" />
                        </TouchableOpacity>
                        {/* Card de informações */}
                        <View style={{ width: '100%', backgroundColor: background2, padding: 20, borderRadius: 24, marginBottom: 24, elevation: 2 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <ThemedText style={{ color: '#6f7791', fontSize: 15 }}>Associado</ThemedText>
                                <ThemedText style={{ color: text2, fontSize: 15 }}>{consulta.NOME}</ThemedText>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <ThemedText style={{ color: '#6f7791', fontSize: 15 }}>Dia(s)</ThemedText>
                                <ThemedText style={{ color: text2, fontSize: 15 }}>{consulta.DATA}</ThemedText>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <ThemedText style={{ color: '#6f7791', fontSize: 15 }}>Horário</ThemedText>
                                <ThemedText style={{ color: text2, fontSize: 15 }}>{consulta.HORARIO}</ThemedText>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <ThemedText style={{ color: '#6f7791', fontSize: 15 }}>Especialista</ThemedText>
                                <ThemedText style={{ color: text2, fontSize: 15 }}>{consulta.ESPECIALISTA}</ThemedText>
                            </View>
                        </View>
                        {/* Cobrança */}
                        <ThemedText style={{ color: text, fontWeight: '400', fontSize: 13, alignSelf: 'flex-start', marginLeft: 8, marginBottom: 4, letterSpacing: 1 }}>COBRANÇA</ThemedText>
                        <View style={{ width: '100%', backgroundColor: background2, padding: 20, borderRadius: 24, marginBottom: 24, elevation: 2 }}>
                            <ThemedText style={{ color: text2, fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Custos</ThemedText>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#E7E9ED', marginBottom: 10 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <ThemedText style={{ color: '#6f7791', fontSize: 16 }}>Agendamento</ThemedText>
                                    <ThemedText style={{ color: '#6f7791', fontSize: 14 }}>{consulta.DATA} às {consulta.HORARIO}</ThemedText>
                                </View>
                                <ThemedText style={{ color: text2, fontWeight: 'bold', fontSize: 16 }}>R$ {consulta.VALOR ? Number(consulta.VALOR).toFixed(2).replace('.', ',') : 'A consultar'}</ThemedText>
                            </View>
                        </View>
                    </>
                )}
            </View>
            {/* Bottom sheet/modal para regulamento */}
            <Modal
                visible={showRegulamento}
                animationType="slide"
                transparent
                onRequestClose={() => setShowRegulamento(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ backgroundColor: background2, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
                        <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: text }}>Informações</ThemedText>
                        <ScrollView style={{ maxHeight: 350 }}>
                            <ThemedText style={{ fontSize: 15, color: text2 }}>{consulta?.REGULAMENTO ? consulta.REGULAMENTO : 'Nenhum regulamento disponível.'}</ThemedText>
                        </ScrollView>
                        <TouchableOpacity 
                            style={{ 
                                marginTop: 24, 
                                alignSelf: 'center', 
                                backgroundColor: '#DA1984',
                                borderRadius: 16, 
                                paddingHorizontal: 32, 
                                paddingVertical: 10,
                                width: '100%',
                            }}
                            onPress={() => setShowRegulamento(false)}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Wrapper>
    );
};

export default AppointmentDetail;