
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Header from "@/components/Header";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SCREEN_WIDTH } from "@/constants/Sizes";

export default function NovaInscricao() {
  const navigator = useNavigation();

  const brand = useThemeColor({}, "brand");
  const lightPinkColor = useThemeColor({}, "lightPink");
  const background = useThemeColor({}, "background");
  const background1 = useThemeColor({}, "background1");
  const background2 = useThemeColor({}, "background2");
  const textColor = useThemeColor({}, "text");

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Header title="Nova matrícula" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 16, paddingVertical: 16 }]}
      >
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          ATIVIDADES
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: background2,
            borderRadius: 16,
            overflow: 'hidden'
          }}
        >
          <TouchableOpacity onPress={() =>  navigator.navigate('(tabs)/(sports)/home')} style={[styles.newRegistrationContainer, { borderBottomColor: background1 }]}>
            <View
              style={[
                styles.newRegistrationIcon,
                { backgroundColor: lightPinkColor },
              ]}
            >
              <IconSymbol name="volleyball-ball" color={brand} size={20} />
            </View>
            <Text
              style={{
                color: textColor,
                fontWeight: "500",
                fontSize: 17,
                flex: 1,
              }}
            >
              Esportes
            </Text>
            <View>
              <IconSymbol
                name="chevron-right"
                size={30}
                color="#b7bbc8"
                library="material"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() =>  navigator.navigate('(tabs)/(cultural)/home')} style={[styles.newRegistrationContainer, { borderBottomColor: background1 }]}>
            <View
              style={[
                styles.newRegistrationIcon,
                { backgroundColor: lightPinkColor },
              ]}
            >
              <IconSymbol name="masks-theater" color={brand} size={20} />
            </View>
            <Text
              style={{
                color: textColor,
                fontWeight: "500",
                fontSize: 17,
                flex: 1,
              }}
            >
              Cultural
            </Text>
            <View>
              <IconSymbol
                name="chevron-right"
                size={30}
                color="#b7bbc8"
                library="material"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() =>  navigator.navigate('(consulta)/index')} style={[styles.newRegistrationContainer, { borderBottomColor: background1 }]}>
            <View
              style={[
                styles.newRegistrationIcon,
                { backgroundColor: lightPinkColor },
              ]}
            >
              <IconSymbol name="heart-pulse" color={brand} size={20} />
            </View>
            <Text
              style={{
                color: textColor,
                fontWeight: "500",
                fontSize: 17,
                flex: 1,
              }}
            >
              Saúde
            </Text>
            <View>
              <IconSymbol
                name="chevron-right"
                size={30}
                color="#b7bbc8"
                library="material"
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E2E7F8" },
  scrollContent: { paddingBottom: 80, width: "100%" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
    marginVertical: 4,
    color: "#39456a",
    paddingHorizontal: 16
  },
  newRegistrationContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    width: SCREEN_WIDTH - 32,
    marginInline: "auto",
    borderBottomWidth: 1,
  },
  newRegistrationIcon: {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  filtersRegistrationsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    gap: 6,
  },
});
