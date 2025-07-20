import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Wrapper } from '@/components/Wrapper';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ManifestacoesCard() {
    const navigation = useNavigation();

    // Theme colors
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const iconCircleBg = useThemeColor({}, 'lightPink');
    const headerTextColor = useThemeColor({}, 'text');
    const subLabelColor = useThemeColor({}, 'text');
    const buttonBg = useThemeColor({}, 'lightPink');
    const buttonTextColor = useThemeColor({}, 'brand');
    const brand = useThemeColor({}, 'brand');

    return (
        <>
            <Header title="Ouvidoria digital" bigTitle />
            <Wrapper style={[styles.container, { backgroundColor: background }]}> 
                <TouchableOpacity
                    style={[styles.header, { backgroundColor: cardBackground }]}
                    onPress={() => navigation.navigate('(manifest)/manifestList')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: iconCircleBg }]}> 
                        <IconSymbol
                            library="fontawesome"
                            name="clock-rotate-left"
                            size={16}
                            color={brand}
                        />
                    </View>
                    <Text style={[styles.headerText, { color: headerTextColor }]}>Manifestações</Text>
                </TouchableOpacity>

                <Text style={[styles.subLabel, { color: subLabelColor }]}>DEIXE A SUA OPINIÃO</Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: buttonBg }]}
                        onPress={() => navigation.navigate('(manifest)/newAudioManifest')}
                    >
                        <IconSymbol
                            library="fontawesome"
                            name="microphone"
                            size={24}
                            color={brand}
                        />
                        <Text style={[styles.buttonText, { color: buttonTextColor }]}>Manif. via áudio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: buttonBg, marginRight: 0 }]}
                        onPress={() => navigation.navigate('(manifest)/newText')}
                    >
                        <IconSymbol
                            library="fontawesome"
                            name="comments"
                            size={24}
                            color={brand}
                        />
                        <Text style={[styles.buttonText, { color: buttonTextColor }]}>Manif. por texto</Text>
                    </TouchableOpacity>
                </View>
            </Wrapper>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 16,
    },
    headerText: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 16,
    },
    arrow: {
        fontSize: 18,
    },
    subLabel: {
        marginTop: 20,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        marginRight: 10,
        alignItems: 'center',
    },
    buttonIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
