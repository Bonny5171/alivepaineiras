// TicketInfo.tsx
import Header from '@/components/Header';
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getStatusColor } from '@/utils/statusColors';

const TicketInfo = () => {
    const route = useRoute();
    // Espera receber o visitante pelo params
    // @ts-ignore
    const visitante = route.params?.visitante;

    // Theme colors
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const avatarBg = useThemeColor({}, 'background2');
    const avatarTextColor = useThemeColor({}, 'brand');
    const nameColor = useThemeColor({}, 'text');
    const subTextColor = useThemeColor({}, 'text2');
    const infoTitleColor = useThemeColor({}, 'text');
    const labelColor = useThemeColor({}, 'text2');
    const valueColor = useThemeColor({}, 'text');

    // Helper para pegar iniciais do nome
    function getInitials(nome?: string) {
        if (!nome) return '';
        const parts = nome.split(' ');
        if (parts.length === 1) return parts[0][0];
        return parts[0][0] + parts[parts.length - 1][0];
    }

    return (
        <>
            <Header title="Detalhes do visitante" />
            <View style={[styles.container, { backgroundColor: background }]}> 
                {/* Avatar + Nome */}
                <View style={styles.avatarContainer}>
                    {visitante?.FOTO ? (
                        <Image source={{ uri: visitante.FOTO }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: avatarBg }]}> 
                            <Text style={[styles.avatarText, { color: avatarTextColor }]}>{getInitials(visitante?.NOME) || '??'}</Text>
                        </View>
                    )}
                    <Text style={[styles.name, { color: nameColor }]}>{visitante?.NOME || 'Visitante'}</Text>
                    <Text style={[styles.subText, { color: subTextColor }]}>Ingresso {visitante?.ORDEM || '-'}</Text>
                </View>

                {/* Informações */}
                <View style={styles.infoContainer}>
                    <Text style={[styles.infoTitle, { color: infoTitleColor }]}>INFORMAÇÕES</Text>

                    <View style={[styles.infoBox, { backgroundColor: cardBackground }]}> 
                        {/* Linha 1 */}
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: labelColor }]}>Pré-cadastro</Text>
                            <View style={[styles.badge, { backgroundColor: getStatusColor(visitante?.IDSTATUS) }]}> {/* cor padronizada */}
                                <Text style={styles.badgeText}>{visitante?.STATUS || 'Aguardando'}</Text>
                            </View>
                        </View>

                        {/* Linha 2 */}
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: labelColor }]}>Gerado em</Text>
                            <Text style={[styles.value, { color: valueColor }]}>{visitante?.GERADO_EM || '-'}</Text>
                        </View>

                        {/* Linha 3 */}
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: labelColor }]}>Data da visita</Text>
                            <Text style={[styles.value, { color: valueColor }]}>{visitante?.DATA_VISITA || '-'}</Text>
                        </View>

                        {/* Linha 4 - Valor */}
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: labelColor }]}>Valor</Text>
                            <Text style={[styles.value, { color: valueColor }]}>R$ {visitante?.VALOR != null ? visitante.VALOR.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#E2E7F8', // replaced by theme
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        // backgroundColor: '#0F1C471A', // replaced by theme
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        // color: '#0F1C47', // replaced by theme
        fontWeight: 'bold',
        fontSize: 24,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        // color: '#1B1B1F', // replaced by theme
        textAlign: 'center',
    },
    subText: {
        // color: '#3E4A59', // replaced by theme
        marginTop: 4,
    },
    infoContainer: {
        alignSelf: 'stretch',
    },
    infoTitle: {
        // color: '#1B1B1F', // replaced by theme
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 12,
    },
    infoBox: {
        // backgroundColor: '#fff', // replaced by theme
        borderRadius: 20,
        padding: 20,
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        // color: '#3E4A59', // replaced by theme
        fontSize: 14,
    },
    value: {
        // color: '#1B1B1F', // replaced by theme
        fontSize: 14,
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeText: {
        color: '#fff', // keep white for contrast
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default TicketInfo;
