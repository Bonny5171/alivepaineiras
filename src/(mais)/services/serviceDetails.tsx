import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { TransformedService } from '@/api/notion/notionTransformer';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Wrapper } from '@/components/Wrapper';

const contactButtons = [
    { label: 'WhatsApp', icon: 'whatsapp', colorKey: 'brand' },
    { label: 'Instagram', icon: 'instagram', colorKey: 'brand' },
    { label: 'Ligar', icon: 'phone', colorKey: 'brand' },
];

export default function ZapService() {
    const route = useRoute();
    const { service } = route.params as { service: TransformedService };

    // Theme colors
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const titleColor = useThemeColor({}, 'text');
    const subtitleColor = useThemeColor({}, 'brand');
    const sectionTitleColor = useThemeColor({}, 'text');
    const listItemColor = useThemeColor({}, 'text2');
    const leftColor = useThemeColor({}, 'text2');
    const rightColor = useThemeColor({}, 'text');
    const contactButtonBg = useThemeColor({}, 'lightPink');
    const contactLabelColor = useThemeColor({}, 'brand');
    const placeholderBg = useThemeColor({}, 'background2');
    const accent = useThemeColor({}, 'brand');

    // Função para formatar os horários
    const formatHorarios = (horariosText: string | null) => {
        if (!horariosText) return [];

        return horariosText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && line.includes('-'))
            .map(line => {
                const [dia, horas] = line.split('-').map(item => item.trim());
                if (dia && horas) {
                    return { dia, horas };
                }
                return null;
            })
            .filter(item => item !== null) as { dia: string; horas: string }[];
    };

    // Função para formatar os serviços da descrição
    const formatServicos = (descricao: string) => {
        if (!descricao) return [];
        return descricao.split('\n').filter(item => item.trim() !== '');
    };

    const handleContactPress = (type: 'whatsapp' | 'instagram' | 'phone') => {
        switch (type) {
            case 'whatsapp':
                if (service.WhatsApp) {
                    Linking.openURL(`https://wa.me/${service.WhatsApp}`);
                }
                break;
            case 'instagram':
                if (service.Instagram) {
                    Linking.openURL(`https://instagram.com/${service.Instagram.replace('@', '')}`);
                }
                break;
            case 'phone':
                if (service.Telefone) {
                    Linking.openURL(`tel:${service.Telefone}`);
                }
                break;
        }
    };

    const horariosFormatados = formatHorarios(service.Horarios);
    const servicosFormatados = formatServicos(service.Descricao);

    const styles = StyleSheet.create({
        container: { flex: 1, padding: 20, backgroundColor: background },
        title: { fontSize: 24, fontWeight: 'bold', color: titleColor, textAlign: 'center', marginTop: 10 },
        subtitleContainer: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: 20 
        },
        subtitle: { 
            fontSize: 14, 
            color: subtitleColor,
            marginLeft: 5 
        },
        section: { marginBottom: 20 },
        sectionTitle: { color: sectionTitleColor, marginBottom: 8, fontWeight: '600' },
        contactRow: { flexDirection: 'row', justifyContent: 'space-between' },
        contactButton: {
            flex: 1, alignItems: 'center', padding: 12, marginHorizontal: 4,
            backgroundColor: contactButtonBg, borderRadius: 12
        },
        contactLabel: { marginTop: 6, fontSize: 14, fontWeight: 'bold', color: contactLabelColor },
        card: {
            backgroundColor: cardBackground, borderRadius: 16, padding: 16,
        },
        listItem: {
            fontSize: 14, color: listItemColor, marginBottom: 4
        },
        row: {
            flexDirection: 'row', justifyContent: 'space-between',
        },
        left: { color: leftColor },
        right: { color: rightColor, fontWeight: 'bold', textAlign: 'right' },
        gallery: {
            flexDirection: 'row', flexWrap: 'wrap',
            justifyContent: 'space-between', gap: 8
        },
        placeholder: {
            width: '30%', aspectRatio: 1,
            backgroundColor: placeholderBg, borderRadius: 10,
            marginBottom: 10
        }
    });

    return (
        <>
            <Header title='Detalhes do serviço' />
            <Wrapper>
                {service.ImageCover && (
                    <Image
                        style={{ width: "100%", height: 200, alignSelf: 'center' }}
                        source={{ uri: service.ImageCover }}
                    />
                )}

                <View style={styles.container}>
                    <Text style={styles.title}>{service.Titulo}</Text>
                    {service.WifiDisponivel && (
                        <View style={styles.subtitleContainer}>
                            <IconSymbol color={subtitleColor} name={"wifi"} size={15} />
                            <Text style={styles.subtitle}>Wi-Fi Paineiras Disponível</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>CONTATO</Text>
                        <View style={styles.contactRow}>
                            {contactButtons.map((btn) => (
                                <TouchableOpacity
                                    key={btn.label}
                                    style={styles.contactButton}
                                    onPress={() => handleContactPress(btn.icon as 'whatsapp' | 'instagram' | 'phone')}
                                >
                                    <IconSymbol name={btn.icon} size={24} color={accent} />
                                    <Text style={styles.contactLabel}>{btn.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {service.Descricao && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>DESCRIÇÃO</Text>
                            <View style={styles.card}>
                                {servicosFormatados.map((item, idx) => (
                                    <Text key={idx} style={styles.listItem}>• {item};</Text>
                                ))}
                            </View>
                        </View>
                    )}

                    {service.Horarios && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>HORÁRIOS</Text>
                            <View style={styles.card}>
                                {horariosFormatados.map((h, idx) => (
                                    <View key={idx} style={styles.row}>
                                        <Text style={styles.left}>{h.dia}</Text>
                                        <Text style={styles.right}>{h.horas}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMAÇÕES</Text>
                        <View style={styles.card}>
                            {service.Telefone && (
                                <View style={styles.row}>
                                    <Text style={styles.left}>Telefone</Text>
                                    <Text style={styles.right}>{service.Telefone}</Text>
                                </View>
                            )}
                            {service.Localizacao && (
                                <View style={styles.row}>
                                    <Text style={styles.left}>Local</Text>
                                    <Text style={[styles.right, { flex: 1, flexWrap: 'wrap', textAlign: 'right' }]} numberOfLines={3} ellipsizeMode="tail">{service.Localizacao}</Text>
                                </View>
                            )}
                            {service.Site && (
                                <View style={styles.row}>
                                    <Text style={styles.left}>Site</Text>
                                    <Text style={styles.right}>{service.Site}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Seção de galeria pode ser mantida se quiser adicionar imagens posteriormente */}
                    {/* <View style={styles.section}>
                        <Text style={styles.sectionTitle}>GALERIA</Text>
                        <View style={styles.gallery}>
                            {galeria.map((item, idx) => (
                                <View key={idx} style={styles.placeholder}>
                                    {item}
                                </View>
                            ))}
                        </View>
                    </View> */}
                </View>
            </Wrapper>
        </>
    );
}