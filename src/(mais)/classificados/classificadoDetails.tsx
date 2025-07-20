import { fetchClassificadosTermos, updateClassificadoStatus } from '@/api/notion/notionService';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Image } from 'react-native';
import ImageView from 'react-native-image-viewing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Wrapper } from '@/components/Wrapper';
import { useAuth } from '@/providers/AuthProvider';

const App = ({ route, navigation }: any) => {

    // Extrair os dados do item recebido via navegação
    const item = route?.params?.item || {
        properties: {
            Nome: { title: [{ text: { content: '' } }] },
            Descrição: { rich_text: [{ text: { content: '' } }] },
            Horários: { rich_text: [{ text: { content: '' } }] },
            Dias: { rich_text: [{ text: { content: '' } }] },
            Telefone: { phone_number: '' },
            WhatsApp: { phone_number: '' },
            Instagram: { rich_text: [{ text: { content: '' } }] },
            Site: { url: '' },
            Endereço: { rich_text: [{ text: { content: '' } }] },
            Preço: { rich_text: [{ text: { content: '' } }] },
            Galeria: { files: [] }
        },
        cover: { external: { url: '' } }
    };

    // Estado para controlar a visualização da imagem em tela cheia
    const [visible, setVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Preparar as imagens para o visualizador
    // Corrigido para pegar corretamente as URLs externas
    const images = item.properties.Galeria.files
        .map((file: any) => ({
            uri: file?.external?.url || file?.file?.url
        }))
        .filter((img: { uri?: string }) => !!img.uri);

    // Adicionar a capa como primeira imagem se existir e não estiver duplicada
    if (item.cover?.external?.url && !images.some((img: { uri?: string }) => img.uri === item.cover.external.url)) {
        images.unshift({ uri: item.cover.external.url });
    }

    // Funções para lidar com os botões de contato
    const handleWhatsApp = () => {
        const phone = item.properties.WhatsApp.phone_number.replace(/\D/g, '');
        Linking.openURL(`https://wa.me/${phone}`);
    };

    const handleInstagram = () => {
        const instagram = item.properties.Instagram.rich_text[0]?.text.content;
        if (instagram) {
            Linking.openURL(`https://instagram.com/${instagram.replace('@', '')}`);
        }
    };

    const handlePhone = () => {
        const phone = item.properties.Telefone.phone_number.replace(/\D/g, '');
        Linking.openURL(`tel:${phone}`);
    };

    const handleWebsite = () => {
        if (item.properties.Site.url) {
            Linking.openURL(item.properties.Site.url);
        }
    };

    // Função para abrir a imagem no visualizador
    const openImageViewer = (index: number) => {
        setCurrentImageIndex(index);
        setVisible(true);
    };

    // Handler para finalizar anúncio
    const handleFinalize = async () => {
        try {
            await updateClassificadoStatus(item.id, 'Finalizado');
            // Aqui você pode adicionar um feedback para o usuário, como um toast ou navegação
            alert('Anúncio finalizado com sucesso!');
        } catch (e) {
            alert('Erro ao finalizar anúncio.');
        }
    };

    // THEME COLORS
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const titleColor = useThemeColor({}, 'text');
    const sectionTitleColor = useThemeColor({}, 'text');
    const contactButtonBg = useThemeColor({}, 'lightPink');
    const contactTextColor = useThemeColor({}, 'brand');
    const boxTextColor = useThemeColor({}, 'text2');
    const boxTitleColor = useThemeColor({}, 'text');
    const accent = useThemeColor({}, 'brand');
    const galleryPlaceholder = useThemeColor({}, 'background2');

    const AuthContext = useAuth();
    const userTitle = AuthContext.user;
    const titular = item.properties.Titular.rich_text[0]?.text.content;
    return (
        <>
            <Header title='Detalhes do anúncio' />
            <Wrapper
                secondaryButtonLabel={userTitle === titular ? 'Editar anúncio' : undefined}
                onSecondaryPress={userTitle === titular ? () => {
                    // Navega para o formulário de edição, passando o item
                    if (route && route.params && route.params.item && navigation) {
                        navigation.navigate('(classificados)/form', { item, isEdit: true });
                    }
                } : undefined}
                primaryButtonLabel={userTitle == titular ? 'Finalizar anúncio' : undefined}
                onPrimaryPress={userTitle == titular ? handleFinalize : undefined}
                primaryColor='#FF3F3F'
            >
                {item.cover?.external?.url ? (
                    <TouchableOpacity onPress={() => openImageViewer(0)}>
                        <Image
                            style={{ width: "100%", height: 200, alignSelf: 'center' }}
                            source={{ uri: item.cover.external.url }}
                        />
                    </TouchableOpacity>
                ) : null}

                <View style={[styles.container, { backgroundColor: background }]}> {/* container bg */}
                    <Text style={[styles.title, { color: titleColor }]}>{item.properties.Nome.title[0].text.content}</Text>

                    <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>CONTATO</Text>
                    <View style={styles.contactGrid}>
                        <TouchableOpacity style={[styles.contactButton, { backgroundColor: contactButtonBg }]} onPress={handleWhatsApp}>
                            <IconSymbol name={"whatsapp"} size={24} color={accent} />
                            <Text style={[styles.contactText, { color: contactTextColor }]}>WhatsApp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.contactButton, { backgroundColor: contactButtonBg }]} onPress={handleInstagram}>
                            <IconSymbol name={"instagram"} size={24} color={accent} />
                            <Text style={[styles.contactText, { color: contactTextColor }]}>Instagram</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.contactButton, { backgroundColor: contactButtonBg }]} onPress={handlePhone}>
                            <IconSymbol name={"phone"} size={24} color={accent} />
                            <Text style={[styles.contactText, { color: contactTextColor }]}>Ligar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.contactButton, { backgroundColor: contactButtonBg }]} onPress={handleWebsite}>
                            <IconSymbol name={"globe"} size={24} color={accent} />
                            <Text style={[styles.contactText, { color: contactTextColor }]}>Website</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>DESCRIÇÃO</Text>
                    <View style={[styles.box, { backgroundColor: cardBackground }]}> {/* box bg */}
                        <Text style={[styles.description, { color: boxTextColor }]}>
                            {item.properties.Descrição.rich_text[0]?.text.content}
                        </Text>
                    </View>

                    <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>HORÁRIOS</Text>
                    <View style={[styles.box, { backgroundColor: cardBackground }]}> {/* box bg */}
                        <View style={styles.row}>
                            <Text style={[styles.day, { color: boxTextColor }]}>{item.properties.Dias.rich_text[0]?.text.content}</Text>
                            <Text style={[styles.hour, { color: boxTitleColor }]}>{item.properties.Horários.rich_text[0]?.text.content}</Text>
                        </View>
                    </View>

                    {(
                        item.properties.Telefone.phone_number ||
                        item.properties.Endereço.rich_text[0]?.text.content ||
                        item.properties.Preço.rich_text[0]?.text.content
                    ) ? (
                        <>
                            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>INFORMAÇÕES</Text>
                            <View style={[styles.box, { backgroundColor: cardBackground }]}> {/* box bg */}
                                {item.properties.Telefone.phone_number ? (
                                    <View style={styles.row}>
                                        <Text style={[styles.day, { color: boxTextColor }]}>Telefone</Text>
                                        <Text style={[styles.hour, { color: boxTitleColor }]}>{item.properties.Telefone.phone_number}</Text>
                                    </View>
                                ) : null}
                                {item.properties.Endereço.rich_text[0]?.text.content ? (
                                    <View style={styles.row}>
                                        <Text style={[styles.day, { color: boxTextColor }]}>Endereço</Text>
                                        <Text style={[styles.hour, { color: boxTitleColor }]}>{item.properties.Endereço.rich_text[0]?.text.content}</Text>
                                    </View>
                                ) : null}
                                {item.properties.Preço.rich_text[0]?.text.content ? (
                                    <View style={styles.row}>
                                        <Text style={[styles.day, { color: boxTextColor }]}>Preço</Text>
                                        <Text style={[styles.hour, { color: boxTitleColor }]}>{item.properties.Preço.rich_text[0]?.text.content}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </>
                    ) : null}

                    {images.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>GALERIA</Text>
                            <View style={styles.gallery}>
                                {images.map((image: { uri: string }, idx: number) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.galleryItem}
                                        onPress={() => openImageViewer(idx)}
                                    >
                                        <Image
                                            source={{ uri: image.uri }}
                                            style={styles.galleryImage}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            </Wrapper>

            {/* Visualizador de imagens em tela cheia */}
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
        </>
    );
};

const styles = StyleSheet.create({
    galleryItem: {
        width: '30%',
        height: 120,
        marginBottom: 8,
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    container: {
        // backgroundColor: '#E2E7F8',
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        // color: '#1A1C3B',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        // color: '#1A1C3B',
        marginTop: 20,
        marginBottom: 8,
    },
    contactGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    contactButton: {
        // backgroundColor: '#D034811A',
        borderRadius: 16,
        width: '48%',
        paddingVertical: 20,
        marginBottom: 12,
        alignItems: 'center',
    },
    contactText: {
        // color: '#0F1C47',
        fontWeight: '600',
        fontSize: 16,
    },
    box: {
        // backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
    },
    description: {
        // color: '#4B4E68',
        fontSize: 14,
        lineHeight: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    day: {
        // color: '#4B4E68',
        fontSize: 14,
    },
    hour: {
        // color: '#1A1C3B',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
    },
    gallery: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
        marginTop: 8,
    },
    placeholder: {
        // backgroundColor: '#FFFFFF',
        width: '30%',
        aspectRatio: 1,
        borderRadius: 8,
        opacity: 0.5,
    },
});

export default App;
