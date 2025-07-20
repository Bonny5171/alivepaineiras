import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  text: string
}

const SectionTitle = ({ text }: Props) => {
  const backgroundColor = useThemeColor({}, 'brand');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 'auto',
    paddingHorizontal: 16,
    paddingBottom: 7,
  },
  text: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '800'
  }
})

export { SectionTitle }
