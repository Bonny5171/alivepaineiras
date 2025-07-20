import React, { useState, useEffect } from 'react';
import { Wrapper } from '@/components/Wrapper';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { enviarFatura, exibirFatura, ExibirFaturaResponse, visualizarBoleto } from '@/api/app/financeiro';
import { TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ListarFaturasItem } from '@/api/app/appTransformer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useError } from '@/providers/ErrorProvider';
import * as Clipboard from 'expo-clipboard';
import Header from '@/components/Header';

export default function Details() {
    const navigation = useNavigation();
    const route = useRoute();
    const { fatura } = route.params;
    const { setError } = useError();

    const [isLoading, setIsLoading] = useState(true);
    const [faturaData, setFaturaData] = useState<ExibirFaturaResponse[] | null>(null);
    const [faturaInfo, setFaturaInfo] = useState<ListarFaturasItem | null>(null);

    const activeBackground = useThemeColor({}, 'activeBackground');

    const sendEmail = () => {
        if (faturaInfo) {
            enviarFatura(faturaInfo?.REFERENCIA);
            setError('Cheque seu e-mail', 'success', 3000, 'A segunda via foi enviada para o e-mail cadastrado.');
            navigation.reset({
                index: 0,
                routes: [{ name: '(tabs)' }],
            });
        }
    }

    const handleCopy = () => {
        if (faturaData && faturaData[0].CODIGO) {
            Clipboard.setStringAsync(faturaData[0].CODIGO).then(() => {
                setError('Copiado para a área de transferência', 'success', 3000, 'Você já pode efetuar o pagamento no app do seu banco.');
            });
        }
    }

    useEffect(() => {
        if (fatura) {
            const parsedFatura = JSON.parse(Array.isArray(fatura) ? fatura[0] : fatura);
            setFaturaInfo(parsedFatura);

            exibirFatura(parsedFatura.REFERENCIA)
                .then((response) => {
                    setFaturaData(response);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                }).finally(() => setIsLoading(false));
        }
    }, [fatura]);

    const visualizarPDF = async () => {
        if (faturaInfo) {
            try {
                const response = await visualizarBoleto(faturaInfo.REFERENCIA);
                if (!response[0].ERRO) {
                    navigation.navigate('(financeiro)/pdfView', {
                        pdfData: response[0].LINK
                    });
                } else {
                    setError(response[0].MSG_ERRO, 'error');
                }
            } catch (error) {
                setError('Erro ao visualizar o boleto', 'error');
            }
        }
    };

    return (
        <>
            <Header title='Detalhes da fatura' />
            <Wrapper
                isLoading={isLoading}
                primaryButtonLabel='Enviar por e-mail'
                onPrimaryPress={faturaData && faturaData[0].ENVIAR ? sendEmail : undefined}
                secondaryButtonLabel='Visualizar Boleto'
                onSecondaryPress={visualizarPDF}
                style={{ padding: 20 }}
            >

                {/* Conteúdo da tela de detalhes */}
                <ThemedText style={{ lineHeight: 16, color: 'gray', paddingBottom: 20, marginTop: 10 }}>Confira os dados e clique no botão abaixo para enviar ao e-mail
                    cadastrado, ou copie o código de barras e pague pelo aplicativo do seu
                    banco.
                </ThemedText>
                {faturaData && faturaInfo && (
                    <View style={{ padding: 20, backgroundColor: activeBackground, marginTop: 10, borderRadius: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <ThemedText style={{ color: 'gray' }}>Status</ThemedText>
                            <View style={{ backgroundColor: faturaInfo.STATUS === "Em Aberto" ? "orange" : "red", paddingHorizontal: 15, borderRadius: 15 }}>
                                <ThemedText style={{ color: 'white' }}>{faturaInfo.STATUS}</ThemedText> {/* Exibe o status da fatura */}
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <ThemedText style={{ color: 'gray' }}>Vencimento</ThemedText>
                            <ThemedText style={{ color: 'gray' }}>{faturaInfo.VENCIMENTO}</ThemedText> {/* Exibe a data de vencimento */}
                        </View>
                        <View>
                            <TouchableOpacity onPress={handleCopy}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                    <ThemedText style={{ fontWeight: 800, fontSize: 18 }}>Código de barras</ThemedText>
                                    <IconSymbol color={"#DA1984"} name={"copy"}/>
                                </View>
                                <ThemedText style={{ color: 'gray' }}>{faturaData[0].CODIGO}</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <View style={{ justifyContent: 'space-between', marginTop: 10 }}>
                            <ThemedText style={{ fontWeight: 800, fontSize: 18 }}>Email de cadastro</ThemedText>
                            <ThemedText style={{ color: 'gray' }}>{faturaData[0].EMAIL}</ThemedText> {/* Exibe a referência da fatura */}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <ThemedText style={{ fontWeight: 800, fontSize: 18 }}>Valor</ThemedText>
                            <ThemedText style={{ fontWeight: 800, fontSize: 18 }}>R$ {faturaInfo.VALOR}</ThemedText> {/* Exibe o valor da fatura */}
                        </View>
                    </View>
                )}
            </Wrapper>
        </>
    );
}