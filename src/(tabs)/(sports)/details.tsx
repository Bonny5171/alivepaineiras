import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import Header from "@/components/Header";
import { cancelarListaDeEspera, cancelarMatricula } from "@/api/app/atividades";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useError } from "@/providers/ErrorProvider";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function DetailsScreen({ route }: any) {
  const { setError } = useError();
  const navigate = useNavigation();

  const brand = useThemeColor({}, "brand");
  const background = useThemeColor({}, 'background');
  const background1 = useThemeColor({}, 'background1');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');

  const {
    NOME,
    ATIVIDADE,
    ESPECIALISTA,
    TURMA,
    STATUS,
    AVATAR,
    HORARIO,
    DATA,
    CATEGORY,
    LOCAL,
  } = route.params;

  const DATAS = {
    'ATIVA': {
      statusBgColor: '#35E07C',
      statusTextColor: '#1A1A22',
    },
    'ESPERA': {
      statusBgColor: '#EA9610',
      statusTextColor: '#1A1A22',
    },
    "CANCELADA": {
      statusBgColor: '#FF3F3F',
      statusTextColor: '#FFF',
    },
    "AGENDAMENTO": {
      statusBgColor: '#e7e9ed',
      statusTextColor: '#1A1A22',
    }
  }[CATEGORY as string]

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Header title="Detalhes" backRoute="/(tabs)/(sports)/home" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 32, paddingBottom: 15 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={{ alignItems: "center" }}>
          <View style={styles.iconPlaceholder}>
            <Text>
              <IconSymbol name='person-swimming' size={40} library='fontawesome' color={'#505979'} />
            </Text>
          </View>

          <Text style={[styles.titulo, { color: textColor }]}>{ATIVIDADE}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, color: textColor, marginRight: 4 }}>
              Status:{" "}
            </Text>
            <View
              style={[styles.statusTag, { backgroundColor: DATAS?.statusBgColor }]}
            >
              <Text style={[styles.statusText, { color: DATAS?.statusTextColor }]}>
                {STATUS}
              </Text>
            </View>
            <View style={styles.associateAvatar}>
              <Image
                resizeMode="contain"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                source={{ uri: AVATAR as string }}
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: background2 }, { gap: 8 }]}>
          <Info label="Associado" value={NOME || '--'} />
          <Info label="Dia(s)" value={DATA || "--"} />
          <Info label="Horário" value={HORARIO || "--"} />
          <Info label="Professor(a)" value={ESPECIALISTA || "--"} />
          <Info label="Local" value={LOCAL || "--"} />
          {CATEGORY === 'ATIVA' && (
            <Info label="Matrícula" value={'Curso sempre cobrado'} />
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: text2Color }]}>DESCRIÇÃO DA ATIVIDADE</Text>
        <View style={[styles.card, { backgroundColor: background2 }]}>
          <Text style={[styles.descricao, { color: text2Color }]}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra volutpats ac ante ipsum primis in faucibus.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#ced2e6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A202C",
    marginBottom: 8,
    textAlign: "center",
  },
  subLink: {
    color: "#D03481",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  status: { fontSize: 13, marginBottom: 16, textAlign: "center" },
  statusTag: {
    backgroundColor: "#07e56e",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#000",
  },
  associateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#a3aac3",
    borderWidth: 2,
    overflow: 'hidden'
  },
  card: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionContainer: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 0,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
    marginVertical: 4,
    paddingHorizontal: 16,
    color: "#39456a",
  },
  descricao: { fontSize: 13, color: "#6f7791" },
  costHeader: { fontWeight: "bold", fontSize: 15, color: "#0F1C47" },
  costLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  costLabel: { fontWeight: "bold", fontSize: 15, color: "#6f7791" },
  costDesc: { fontSize: 12, color: "#6f7791" },
  costValue: { fontWeight: "bold", fontSize: 15, color: "#0F1C47" },
  botaoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    height: "auto",
    width: "100%",
    padding: 16,
    backgroundColor: "white",
  },
  botao: {
    backgroundColor: "#DA1984",
    padding: 13,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  textoBotao: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  fakeCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#D53F8C",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#D53F8C",
    borderColor: "#D53F8C",
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
    color: "#1A202C",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  toast: {
    position: "absolute",
    top: "50%",
    left: 16,
    right: 16,
    backgroundColor: "#48BB78",
    padding: 16,
    borderRadius: 24,
    transform: [{ translateY: -50 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  toastMessage: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    textAlign: "center",
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    backgroundColor: "#FED7D7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#C53030",
    fontSize: 14,
  },
});

function Info({ label, value }: { label: string; value: string | string[] }) {
  const text2Color = useThemeColor({}, 'text2');

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontSize: 15, color: "#878da3" }}>{label}</Text>
      <Text style={{ fontSize: 15, color: text2Color }}>
        {value?.toString()}
      </Text>
    </View>
  );
}
