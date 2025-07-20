import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ClubeInfo() {
    const route = useRoute();
    // @ts-ignore
    const imagemContato = route.params?.imagemContato;

    // Theme colors
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const titleColor = useThemeColor({}, 'text');
    const descriptionColor = useThemeColor({}, 'text2');
    const sectionTitleColor = useThemeColor({}, 'text');
    const contactButtonBg = useThemeColor({}, 'lightPink');
    const contactTextColor = useThemeColor({}, 'text');
    const brand = useThemeColor({}, 'brand');

    return (
        <>
            <Header title="Clube Paineiras" />
            <ScrollView style={[styles.container, { backgroundColor: background }]}> 
                <Image
                    source={{ uri: imagemContato }}
                    style={styles.image}
                    resizeMode="cover"
                />

                <View style={[styles.infoBox, { backgroundColor: cardBackground }]}> 
                    <Text style={[styles.title, { color: titleColor }]}>Clube Paineiras</Text>
                    <Text style={[styles.description, { color: descriptionColor }]}> 
                        O Clube Paineiras do Morumby é um dos clubes sociais mais tradicionais de São Paulo.
                        O clube oferece uma ampla gama de atividades esportivas e sociais, como natação, tênis, futebol, vôlei, judô, squash, além de eventos culturais e sociais.
                    </Text>
                    <Text style={[styles.description, { marginTop: 12, fontWeight: 'bold', color: descriptionColor }]}> 
                        📍Endereço: Av. Dr. Alberto Penteado, 605 – Morumbi, São Paulo – SP
                    </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>CONTATO</Text>

                <View style={styles.grid}>
                    {/* <TouchableOpacity style={styles.contactButton} onPress={() => {
                        Linking.openURL('https://wa.me/551137792000');
                    }}>
                        <IconSymbol name="whatsapp" size={24} color={brand} />
                        <Text style={[styles.contactText, { color: contactTextColor }]}>WhatsApp</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity style={[styles.contactButton, { backgroundColor: contactButtonBg }]} onPress={() => {
                        Linking.openURL('https://instagram.com/clubepaineirasoficial');
                    }}>
                        <IconSymbol name="instagram" size={24} color={brand} />
                        <Text style={[styles.contactText, { color: contactTextColor }]}>Instagram</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.contactButton, { backgroundColor: contactButtonBg }]} onPress={() => {
                        Linking.openURL('tel:+551137792000');
                    }}>
                        <IconSymbol name="phone" size={24} color={brand} />
                        <Text style={[styles.contactText, { color: contactTextColor }]}>Ligar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.contactButton, { backgroundColor: contactButtonBg }]} onPress={() => {
                        Linking.openURL('https://clubepaineiras.org.br');
                    }}>
                        <IconSymbol name="globe" size={24} color={brand} />
                        <Text style={[styles.contactText, { color: contactTextColor }]}>Website</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
    },
    infoBox: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    contactButton: {
        width: '48%',
        borderRadius: 20,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 12,
    },
    contactText: {
        marginTop: 8,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
