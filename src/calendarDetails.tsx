import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Header from "@/components/Header";
import { ThemedText } from "@/components/ThemedText";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useThemeColor } from '@/hooks/useThemeColor';

const CalendarDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    IDATIVIDADE,
    NOME,
    HRINICIO,
    DTATIVIDADE,
    DIAS,
    USERNAME,
    LOCAL,
    AVATAR,
    CANCELADA,
    TIPO,
  } = route.params || {};

  const [isLoading, setIsLoading] = React.useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const background2Color = useThemeColor({}, 'background2');
  const errorBackgroundColor = useThemeColor({}, 'errorBackground');
  const successBackgroundColor = useThemeColor({}, 'successBackground');
  const reversedTextColor = useThemeColor({}, 'reversedText');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const highlightTextColor = useThemeColor({}, 'highlightText');
  const text2Color = useThemeColor({}, 'text2');
  const tertiaryTextColor = useThemeColor({}, 'tertiaryText');
  const brandColor = useThemeColor({}, 'brand');

  const handleViewActivity = () => {
    if (!IDATIVIDADE) {
      return; // Evita navegação se IDATIVIDADE não estiver disponível
    }
    navigation.navigate('ActivityDetails', {
      atividade: JSON.stringify({ IDATIVIDADE }),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Header title="Detalhes do evento" backRoute="/(tabs)/(sports)/home" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ alignItems: "center" }}>
          <View style={[styles.statusBadge, CANCELADA ? { backgroundColor: errorBackgroundColor } : { backgroundColor: successBackgroundColor }]}>
            <ThemedText style={[styles.statusText, { color: reversedTextColor }]}>
              {CANCELADA ? "Cancelada" : "Ativa"}
            </ThemedText>
          </View>
          <Text style={[styles.eventTitle, { color: primaryTextColor }]}>
            {NOME || "Nome não disponível"}
          </Text>
          <Text style={[styles.eventTime, { color: highlightTextColor }]}>
            {DIAS || "Data não disponível"} - {HRINICIO || "Horário não disponível"}
          </Text>
        </View>

        {CANCELADA && (
          <View style={[styles.justificationCard, { backgroundColor: background2Color }]}>
            <Text style={[styles.sectionTitle, { color: text2Color }]}>
              Justificativa do Cancelamento
            </Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={brandColor} />
              </View>
            ) : (
              <Text style={[styles.justificationText, { color: tertiaryTextColor }]}>
                Justificativa não fornecida.
              </Text>
            )}
          </View>
        )}

        <View style={[styles.detailsContainer, { backgroundColor: background2Color }]}>
          <View style={styles.detailItem}>
            <ThemedText style={[styles.detailLabel, { color: tertiaryTextColor }]}>
              Associado
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: text2Color }]}>
              {USERNAME || "Associado não disponível"}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText style={[styles.detailLabel, { color: tertiaryTextColor }]}>
              ID da Atividade
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: text2Color }]}>
              {IDATIVIDADE || "ID não disponível"}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText style={[styles.detailLabel, { color: tertiaryTextColor }]}>
              Data
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: text2Color }]}>
              {DIAS || DTATIVIDADE || "Data não disponível"}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText style={[styles.detailLabel, { color: tertiaryTextColor }]}>
              Local
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: text2Color }]}>
              {LOCAL || "Local não disponível"}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 16 },
  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "400",
  },
  eventTitle: {
    fontWeight: "600",
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  eventTime: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  justificationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  justificationText: {
    fontSize: 13,
    lineHeight: 20,
  },
  detailsContainer: {
    flexDirection: "column",
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "400",
    marginRight: 5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "400",
    marginRight: 15,
  },
  viewActivityButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  viewActivityButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CalendarDetailsScreen;