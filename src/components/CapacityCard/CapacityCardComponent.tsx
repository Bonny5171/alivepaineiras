import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { IconSymbol } from "../ui/IconSymbol";

interface CapacityCardComponentProps {
  currentCapacity: string;
  operatingHours: string;
  currentCapacityAcademy: string;
  currentCapacityParking: string;
}

const CapacityCardComponent: React.FC<CapacityCardComponentProps> = ({
  currentCapacity,
  operatingHours,
  currentCapacityAcademy,
  currentCapacityParking,
}) => {
  const activeBackground = useThemeColor({}, "activeBackground");
  const background1Color = useThemeColor({}, 'background1');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const text3Color = useThemeColor({}, 'text3');

  const capacityNumberOnly = currentCapacity.replace(/\D/g, '');

  const styles = StyleSheet.create({
    container: {
      padding: 0,
      marginVertical: 0,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "400",
      textTransform: "uppercase",
      color: textColor,
      marginBottom: 8,
    },
    content: {
      flexDirection: "row",
      gap: 12,
    },
    card: {
      backgroundColor: background1Color,
      borderRadius: 16,
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 10,
      marginHorizontal: 0,
    },
    iconContainer: {
      marginRight: 12,
    },
    textContainer: {
      flexDirection: "column",
      flex: 1,
    },
    rotulo: {
      fontSize: 13,
      fontWeight: "700",
      color: text2Color,
      lineHeight: 14,
      marginBottom: 2,
    },
    quantidade: {
      fontSize: 13,
      fontWeight: "500",
      color: text3Color,
      lineHeight: 14,
    },
  });

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Ocupação</ThemedText>
      <View style={styles.content}>
        {/* Item 1: Clube */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <IconSymbol library="fontawesome" name={"building"} color={"#666"} size={30} />
          </View>
          <View style={styles.textContainer}>
            <ThemedText
              style={styles.rotulo}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Clube
            </ThemedText>
            <ThemedText
              style={styles.quantidade}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {capacityNumberOnly}
            </ThemedText>
          </View>
        </View>

        {/* Item 2: Acad... */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <IconSymbol library="fontawesome" name={"dumbbell"} color={"#666"} size={24} />
          </View>
          <View style={styles.textContainer}>
            <ThemedText
              style={styles.rotulo}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Academia
            </ThemedText>
            <ThemedText
              style={styles.quantidade}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {currentCapacityAcademy}
            </ThemedText>
          </View>
        </View>

        {/* Item 3: Estaci... */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <IconSymbol library="fontawesome" name={"car"} color={"#666"} size={24} />
          </View>
          <View style={styles.textContainer}>
            <ThemedText
              style={styles.rotulo}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Estacionamento
            </ThemedText>
            <ThemedText
              style={styles.quantidade}
              numberOfLines={1}
              ellipsizeMode="tail"
            > 
              {currentCapacityParking}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CapacityCardComponent;
