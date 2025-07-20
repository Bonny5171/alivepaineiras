import React from 'react';
import { View, StyleSheet, Dimensions, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { RouteProp, useRoute } from '@react-navigation/native';
import Header from '@/components/Header';
import { Wrapper } from '@/components/Wrapper';
import { useThemeColor } from '@/hooks/useThemeColor';

// Define o tipo esperado para os params da rota
interface PdfViewRouteParams {
    pdfData: string;
}

export default function PdfViewer() {
    const route = useRoute<RouteProp<Record<string, PdfViewRouteParams>, string>>();
    const { pdfData } = route.params as PdfViewRouteParams;

    const browserUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfData)}`;
    // Usando PDF.js para visualização fullscreen do PDF
    // Adiciona o parâmetro #zoom=page-width para ajustar à largura da janela
    const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfData)}#zoom=page-width`;

    const background = useThemeColor({}, 'background');
    const background2 = useThemeColor({}, 'background2');
    const shadow = useThemeColor({}, 'shadow');

    return (
        <>
            <Header title="Visualizar Boleto" />
            <Wrapper
                primaryButtonLabel='Abrir no navegador'
                onPrimaryPress={() => {
                    if (pdfData) {
                        const url = browserUrl
                        Linking.openURL(url);
                    }
                }}
                style={[styles.container, { backgroundColor: background }]}>
                <View style={[styles.pdfBox, { backgroundColor: background2, shadowColor: shadow }]}>
                    <WebView
                        originWhitelist={['*']}
                        source={{ uri: viewerUrl }}
                        style={styles.webview}
                    />
                </View>
            </Wrapper>
        </>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 36,
        alignItems: 'center',
    },
    pdfBox: {
        // Proporção A4: 1:1.414 (largura:altura)
        width: width * 0.9,
        height: (width * 0.9) * 1.414,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    webview: {
        flex: 1,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
});