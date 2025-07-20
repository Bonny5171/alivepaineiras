import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ButtonActionsProps {
  TRANSFERIR: boolean;
  MATRICULAR: boolean;
  CANCELAR: boolean;
  INSCRITO: boolean;
  INSCREVER: boolean;
  CANCELAR_CANCELAMENTO: boolean;
  IDENTIFICADOR: string;
  IDAREA: string;
  DESCRICAO: string;
  USERTITULO: string;
  USERAVATAR: string;
  ANTIGATURMA: string;
  ICONE: string; // Adicionado para garantir passagem do ícone
  onMatricular: () => void;
  onIncluir: () => void;
  onCancelarMatricula: () => void;
  onCancelarEspera: () => void;
  onCancelarCancelamento: () => void;
}

const styles = {
  botaoContainer: {
    height: "auto",
    width: "100%",
    padding: 16,
    gap: 8,
    display: "flex",
    flexDirection: "column",
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
};

export const ButtonActions: React.FC<ButtonActionsProps> = (props) => {
  const {
    CANCELAR,
    MATRICULAR,
    TRANSFERIR,
    CANCELAR_CANCELAMENTO,
    INSCRITO,
    INSCREVER,
    ANTIGATURMA,
    IDAREA,
    DESCRICAO,
    USERAVATAR,
    USERTITULO,
    IDENTIFICADOR,
    ICONE, // Adicionado aqui
    onMatricular,
    onIncluir,
    onCancelarEspera,
    onCancelarMatricula,
    onCancelarCancelamento,
  } = props;

  const navigation = useNavigation();
  const brand = useThemeColor({}, "brand");
  const background2 = useThemeColor({}, "background2");

  if (!CANCELAR && !MATRICULAR && !TRANSFERIR && !INSCREVER && !INSCRITO && !CANCELAR_CANCELAMENTO) return null;

  return (
    <View style={[styles.botaoContainer, { backgroundColor: background2 }]}> 
      {TRANSFERIR && (
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#F9D9EB" }]}
          onPress={() => {
            navigation.navigate("(tabs)/(sports)/transferRegistration", {
              IDENTIFICADOR,
              IDAREA,
              DESCRICAO,
              USERTITULO,
              USERAVATAR,
              ANTIGATURMA,
              ICONE, // Adicionado para garantir que o ícone seja passado
            });
          }}
        >
          <Text style={[styles.textoBotao, { color: brand }]}>Trocar turma</Text>
        </TouchableOpacity>
      )}
      {(CANCELAR && !CANCELAR_CANCELAMENTO) && (
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#FF3F3F" }]}
          onPress={INSCRITO ? onCancelarEspera : onCancelarMatricula}
        >
          <Text style={styles.textoBotao}>
            {INSCRITO ? "Sair da Lista de Espera" : "Cancelar matrícula"}
          </Text>
        </TouchableOpacity>
      )}
      {MATRICULAR && (
        <TouchableOpacity
          style={[styles.botao]}
          onPress={INSCREVER ? onIncluir : onMatricular}
        >
          <Text style={styles.textoBotao}>
            {INSCREVER ? "Entrar na lista de espera" : "Confirmar matrícula"}
          </Text>
        </TouchableOpacity>
      )}
      {CANCELAR_CANCELAMENTO && (
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#FF3F3F" }]}
          onPress={onCancelarCancelamento}
        >
          <Text style={styles.textoBotao}>Desistir do cancelamento</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
