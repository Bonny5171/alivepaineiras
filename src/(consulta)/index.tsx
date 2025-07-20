import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import DynamicList, { ListItem } from '@/components/DynamicList';
import DynamicListSkeleton from '@/components/DynamicListSkeleton';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import { useNavigation } from '@react-navigation/native';
import { listarAssociados, listarEspecialistas, Associado, Especialista } from '@/api/app/consultas';
import { AssociadosList } from '@/components/AssociadosList';
import { BottomSheet } from '@/components/BottomSheet';
import ScheduledAppointments from './scheduledAppointments';
import { listarConsultas, listarConsultasCanceladas } from '@/api/app/appointments';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Home() {
    const navigation = useNavigation();
    const [associados, setAssociados] = useState<Associado[]>([]);
    const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
    const [loadingAssociados, setLoadingAssociados] = useState(true);
    const [loadingEspecialistas, setLoadingEspecialistas] = useState(true);
    const [selectedAssociado, setSelectedAssociado] = useState<string>('todos');
    const [selectedEspecialista, setSelectedEspecialista] = useState<string | null>(null);
    const [showAppointmentsSheet, setShowAppointmentsSheet] = useState(false);
    const [appointmentsType, setAppointmentsType] = useState<'ativas' | 'canceladas'>('ativas');
    const [consultasAtivasCount, setConsultasAtivasCount] = useState<number>(0);
    const [consultasCanceladasCount, setConsultasCanceladasCount] = useState<number>(0);

    const background2 = useThemeColor({}, 'background2');
    const iconBackgroundLight = useThemeColor({}, 'iconBackgroundLight');
    const primaryTextDark = useThemeColor({}, 'primaryTextDark');
    const secondaryTextLight = useThemeColor({}, 'secondaryTextLight');
    const shadow = useThemeColor({}, 'shadow');
    const text = useThemeColor({}, 'text');
    const text2 = useThemeColor({}, 'text2');
    const lightPink = useThemeColor({}, 'lightPink');
    const brand = useThemeColor({}, 'brand');
    const contrastText = useThemeColor({}, 'contrastText');

    React.useEffect(() => {
        listarAssociados().then(data => {
            setAssociados(data);
            setLoadingAssociados(false);
        }).catch(() => setLoadingAssociados(false));
        listarEspecialistas().then(data => {
            setEspecialistas(data);
            setLoadingEspecialistas(false);
        }).catch(() => setLoadingEspecialistas(false));
    }, []);

    React.useEffect(() => {
        setLoadingEspecialistas(true);
        listarEspecialistas().then(data => {
            setEspecialistas(data);
            setLoadingEspecialistas(false);
        }).catch(() => setLoadingEspecialistas(false));
    }, []);

    React.useEffect(() => {
        let ignore = false;
        async function fetchConsultasCount() {
            setConsultasAtivasCount(0);
            setConsultasCanceladasCount(0);
            try {
                const titulo = selectedAssociado === 'todos' ? '0' : selectedAssociado;
                const consultas = await listarConsultas(titulo);
                if (ignore) return;
                if (consultas.length > 0 && consultas[0].ERRO) {
                    setConsultasAtivasCount(0);
                } else {
                    setConsultasAtivasCount(consultas.filter((item: any) => item.STATUS === 'Ativas').length);
                }
                const canceladas = await listarConsultasCanceladas(titulo);
                if (canceladas.length > 0 && canceladas[0].ERRO) {
                    setConsultasCanceladasCount(0);
                } else {
                    setConsultasCanceladasCount(canceladas.length);
                }
            } catch {
                if (!ignore) {
                    setConsultasAtivasCount(0);
                    setConsultasCanceladasCount(0);
                }
            }
        }
        fetchConsultasCount();
        return () => { ignore = true; };
    }, [selectedAssociado]);

    const handleShowAppointmentsSheet = (type: 'ativas' | 'canceladas', count: number) => {
        if (count === 0) return;
        setAppointmentsType(type);
        setShowAppointmentsSheet(true);
    };

    return (
        <>
            <Header title='Saúde' bigTitle />
            <Wrapper style={{ padding: 16 }}>
                <View style={{ marginTop: 20, marginBottom: 10 }}>
                    <TouchableOpacity
                        style={[styles.examsButton, { backgroundColor: background2, shadowColor: shadow }]}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('(consulta)/scheduledExams')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundLight }]}>
                            <IconSymbol name="stethoscope" size={18} color={brand} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.examsText, { color: primaryTextDark }]}>Exames</Text>
                        </View>
                        <IconSymbol name="chevron-right" size={14} color={secondaryTextLight} />
                    </TouchableOpacity>
                    <AssociadosList
                        titulo="ASSOCIADOS"
                        selectedAssociado={selectedAssociado}
                        onSelect={setSelectedAssociado}
                    />
                    <Text style={[styles.sectionTitle, { color: text }]}>ACOMPANHE SUAS INSCRIÇÕES</Text>
                    <View style={styles.consultasContainer}>
                        <TouchableOpacity
                            style={[styles.consultaButton, { backgroundColor: lightPink, opacity: consultasAtivasCount === 0 ? 0.5 : 1 }]}
                            onPress={() => handleShowAppointmentsSheet('ativas', consultasAtivasCount)}
                            activeOpacity={consultasAtivasCount === 0 ? 1 : 0.7}
                            disabled={consultasAtivasCount === 0}
                        >
                            <IconSymbol name="check" size={32} color={brand} />
                            <Text style={[styles.consultaTitle, { color: text2 }]}>Consultas Ativas</Text>
                            {loadingEspecialistas ? (
                                <ActivityIndicator style={styles.indicator} size="small" color={brand} />
                            ) : (
                                <Text style={[styles.countText, { color: secondaryTextLight }]}>{consultasAtivasCount} registro{consultasAtivasCount === 1 ? '' : 's'}</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.consultaButton, { backgroundColor: lightPink, opacity: consultasCanceladasCount === 0 ? 0.5 : 1 }]}
                            onPress={() => handleShowAppointmentsSheet('canceladas', consultasCanceladasCount)}
                            activeOpacity={consultasCanceladasCount === 0 ? 1 : 0.7}
                            disabled={consultasCanceladasCount === 0}
                        >
                            <IconSymbol name="xmark" size={32} color={brand} />
                            <Text style={[styles.consultaTitle, { color: text2 }]}>Consultas Cancel.</Text>
                            {loadingEspecialistas ? (
                                <ActivityIndicator style={styles.indicator} size="small" color={brand} />
                            ) : (
                                <Text style={[styles.countText, { color: secondaryTextLight }]}>{consultasCanceladasCount} registro{consultasCanceladasCount === 1 ? '' : 's'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    {loadingEspecialistas ? <ActivityIndicator style={{ marginTop: 16 }} color={brand} /> :
                        <DynamicList
                            data={especialistas.map(e => ({
                                id: String(e.IDESPECIALISTA),
                                title: e.ESPECIALIDADE,
                                subtitle: e.ESPECIALISTA,
                                icon: e.ICONE || "fa-user-doctor",
                                iconLibrary: 'fontawesome',
                                category: e?.IDCATEGORIA === 1 ? 'Especialistas' : 'Outros',
                            }))}
                            onClickPrimaryButton={(item) => {
                                if (item.title === "PAR-Q") {
                                    navigation.navigate("parqList");
                                } else {
                                    setSelectedEspecialista(item.id);
                                    navigation.navigate('(consulta)/newConsulta', { especialista: item });
                                }
                            }}
                        />
                    }
                </View>
            </Wrapper>
            <BottomSheet visible={showAppointmentsSheet} onClose={() => setShowAppointmentsSheet(false)} dismissible>
                <ScrollView style={{ maxHeight: 600 }}>
                    <ScheduledAppointments 
                        type={appointmentsType} 
                        onClose={() => setShowAppointmentsSheet(false)} 
                        titulo={selectedAssociado === 'todos' ? '0' : selectedAssociado}
                    />
                </ScrollView>
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: brand }]}
                    onPress={() => setShowAppointmentsSheet(false)}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.closeButtonText, { color: contrastText }]}>Fechar</Text>
                </TouchableOpacity>
            </BottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    examsButton: {
        borderRadius: 13,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 18,
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        borderRadius: 10,
        padding: 10,
        marginRight: 12,
    },
    examsText: {
        fontSize: 17,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '400',
        marginBottom: 8,
        marginTop: 10,
        marginLeft: 10,
    },
    consultasContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    consultaButton: {
        borderRadius: 20,
        flex: 1,
        alignItems: 'center',
        paddingVertical: 24,
        marginHorizontal: 8,
    },
    consultaTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    countText: {
        fontSize: 14,
        marginTop: 2,
    },
    indicator: {
        marginTop: 2,
    },
    closeButton: {
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 10,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: '600',
    },
});