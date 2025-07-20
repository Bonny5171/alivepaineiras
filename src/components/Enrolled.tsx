import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/providers";
import { listarAssociadosMatriculados, ListarAssociadosMatriculadosResponseItem } from "@/api/app/atividades";
import { useThemeColor } from "@/hooks/useThemeColor";

interface EnrolledProps {
  IDATIVIDADE: string;
  TURMA: string;
}

const styles = {
  sectionTitle: { fontSize: 14, fontWeight: "400", marginVertical: 4, paddingHorizontal: 16, color: "#39456a" },
  card: { display: "flex", flexDirection: "column", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 16 },
  enrolledImageContainer: { width: 40, height: 40, borderRadius: 28, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  enrolledAvatarImage: { width: 40, height: 40, borderRadius: 28 },
};

export const Enrolled: React.FC<EnrolledProps> = ({ IDATIVIDADE, TURMA }) => {
  const navigation = useNavigation();
  const AuthContext = useAuth();
  const brand = useThemeColor({}, "brand");
  const background = useThemeColor({}, "background");
  const background2 = useThemeColor({}, "background2");
  const text2Color = useThemeColor({}, "text2");
  const [enrolled, setEnrolled] = useState<ListarAssociadosMatriculadosResponseItem[]>([]);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(true);

  const fetchEnrolled = async () => {
    setIsLoadingEnrolled(true);
    try {
      const response = await listarAssociadosMatriculados({
        IDATIVIDADE: Number(IDATIVIDADE),
        TURMA,
        TITULO: AuthContext.user,
      });
      setEnrolled(response);
    } catch (error) {
      console.error("Erro ao buscar matriculados:", error);
    }
    setIsLoadingEnrolled(false);
  };

  useEffect(() => {
    fetchEnrolled();
  }, []);

  if (!enrolled && !isLoadingEnrolled) return null;

  return (
    <>
      <Text style={[styles.sectionTitle, { color: text2Color }]}>TURMA {TURMA}</Text>
      <View style={[styles.card, { backgroundColor: background2 }]}> 
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          {enrolled.slice(0, 10).map((item, index) => {
            const getInitials = () => {
              if (!item.NOME) return "";
              const nameParts = item.NOME.split(" ");
              if (nameParts.length > 1) {
                return `${nameParts[0][0]}${nameParts[1][0]}`;
              }
              return nameParts[0][0];
            };
            return (
              <View
                key={item.TITULO || `enrolled-${index}`}
                style={[
                  styles.enrolledImageContainer,
                  { marginLeft: -15, borderWidth: 2, backgroundColor: "#eee", borderColor: background },
                ]}
              >
                {item.AVATAR ? (
                  <Image source={{ uri: item.AVATAR }} style={[styles.enrolledAvatarImage]} />
                ) : (
                  <Text style={{ color: "#0F1C47" }}>{getInitials()}</Text>
                )}
              </View>
            );
          })}
          {enrolled.length > 10 && (
            <Text style={{ fontSize: 12, fontWeight: "600", color: text2Color, marginLeft: 10 }}>+{enrolled.length - 10}</Text>
          )}
        </View>
        {enrolled.length > 0 && (
          <TouchableOpacity style={{ marginTop: 25 }} onPress={() => {
            navigation.navigate("(tabs)/(sports)/enrolledGroup", { DATA: enrolled, TURMA });
          }}>
            <Text style={{ fontSize: 20, fontWeight: "400", color: brand, textAlign: "center" }}>Ver Matriculados</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};
