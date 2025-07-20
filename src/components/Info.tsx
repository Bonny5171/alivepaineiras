import React from "react";
import { View, Text } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface InfoProps {
  label: string;
  value: string | string[];
}

export const Info: React.FC<InfoProps> = ({ label, value }) => {
  const text2Color = useThemeColor({}, "text2");
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      minHeight: 28,
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 15, color: "#878da3" }}>{label}</Text>
      <Text
        style={{ fontSize: 15, color: text2Color }}
        numberOfLines={1}
        adjustsFontSizeToFit={true}  // apenas iOS
        minimumFontScale={0.8}  // escala mínima da fonte
      >{value?.toString()}</Text>
    </View>
  );
};
