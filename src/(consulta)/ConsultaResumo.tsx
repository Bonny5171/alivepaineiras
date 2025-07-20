import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useError } from '@/providers/ErrorProvider';
import { gravarHorario } from '@/api/app/consultas';
import Header from '@/components/Header';
import { Wrapper } from '@/components/Wrapper';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/providers';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ConsultaResumo() {
  const AuthContext = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { setError } = useError();
  const confirm = useConfirmation();
  const [loading, setLoading] = useState(false);
  const [aceito, setAceito] = useState(false);
  const [showRegulamento, setShowRegulamento] = useState(false);
  const iconText = useThemeColor({}, 'iconText');
  const text2 = useThemeColor({}, 'text2');
  const tertiaryText = useThemeColor({}, 'tertiaryText');
  const iconBgColor = useThemeColor({}, 'background1');
  const background = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'background2');

  // Dados recebidos via navigation
  // @ts-ignore
  const params = route.params as any || {};
  const especialista = params.especialista;
  const especialidade = params.especialidade;
  const selectedAssociado = params.selectedAssociado;
  const selectedDate = params.selectedDate;
  const selectedHorario = params.selectedHorario;
  const chaveHorario = params.chaveHorario;
  const idEspecialista = params.idEspecialista;
  const regulamento = params.regulamento || '';
  const iconEspecialistaParam = params.iconEspecialista;

  if (!especialista || !especialidade || !selectedAssociado || !selectedDate || !selectedHorario || !chaveHorario) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: background }}>
        <Text style={{ color: text2, fontSize: 16 }}>Dados incompletos para resumo da consulta.</Text>
      </View>
    );
  }

  // Formatar data para dd/mm/yyyy
  let dataFormatada = selectedDate;
  if (selectedDate && selectedDate.includes('-')) {
    const [ano, mes, dia] = selectedDate.split('-');
    dataFormatada = `${dia}/${mes}/${ano}`;
  }

  const handleConfirmar = async () => {
    confirm.showConfirmation(
      'Confirmação',
      async () => {
        setLoading(true);
        try {
          await gravarHorario(selectedHorario);
          setError('Consulta agendada com sucesso!', 'success');
          navigation.reset({
            index: 0,
            routes: [
              { name: '(tabs)' },
              { name: '(consulta)/index' },
            ] as any // Corrige erro de tipagem
          });
        } catch (e) {
          setError('Erro ao agendar consulta.', 'error');
        }
        setLoading(false);
      },
      {
        beforePasswordComponents: [
          
          <View style={[
            // styles.modalContainer,
            { backgroundColor: cardBackground }
          ]}>
            <Text style={[styles.modalTitle, { color: text2 }]}>Informações</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              <Text style={{ fontSize: 15, color: tertiaryText }}>{regulamento ? regulamento : 'Nenhum regulamento disponível.'}</Text>
            </ScrollView>
          </View>
          ,
          <View key="info" style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, marginBottom: 8, color: text2 }}>
              Data da consulta: <Text style={{ fontWeight: 'normal' }}>{dataFormatada}</Text>
            </Text>
            <Text style={{ fontSize: 18, color: text2 }}>
              Especialista: <Text style={{ fontWeight: 'normal' }}>{especialista}</Text>
            </Text>
          </View>,
        ],
        canConfirm: aceito,
      }
    );
  };

  // Valor do agendamento vindo da rota (se disponível)
  const valorAgendamento =
    typeof params.valorHorario !== 'undefined' && params.valorHorario !== null
      ? `R$${Number(params.valorHorario).toFixed(2).replace('.', ',')}`
      : 'A consultar';

  return (
    <>
      <Header title="Detalhes do agendamento" />
      <Wrapper
        style={{ padding: 16, backgroundColor: background }}
        isLoading={loading}
        primaryButtonLabel="Confirmar Consulta"
        onPrimaryPress={handleConfirmar}
      >
        <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 8 }}>
          <View style={{ backgroundColor: iconBgColor, borderRadius: 20, width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <IconSymbol
              color={iconText}
              name={iconEspecialistaParam || 'hands'}
              library="fontawesome"
              size={56}
            />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '600', color: text2, marginBottom: 2 }}>{especialidade || 'Especialidade'}</Text>
          <Text style={{ fontSize: 15, color: tertiaryText, opacity: 0.7, marginBottom: 8 }}>{especialista || 'Especialista'}</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 18 }} onPress={() => setShowRegulamento(true)}>
            <Text style={{ color: '#DA1984', fontWeight: '600', fontSize: 15 }}>Informações</Text>
            <IconSymbol name="file-lines" library="fontawesome" size={20} color="#DA1984" />
          </TouchableOpacity>
        </View>
        <View style={[styles.cardResumo, { backgroundColor: cardBackground }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.label, { color: tertiaryText }]}>Associado</Text>
            <Text style={[styles.value, { color: text2 }]}>{selectedAssociado?.NOME || selectedAssociado?.nome}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.label, { color: tertiaryText }]}>Dia(s)</Text>
            <Text style={[styles.value, { color: text2 }]}>{dataFormatada}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.label, { color: tertiaryText }]}>Horário</Text>
            <Text style={[styles.value, { color: text2 }]}>{selectedHorario}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[styles.label, { color: tertiaryText }]}>Especialista</Text>
            <Text
              style={[styles.value, { color: text2, textAlign: 'right', maxWidth: 180 }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {especialista || 'Especialista'}
            </Text>
          </View>
        </View>
        <Text style={[styles.cobrancaTitle, { color: text2 }]}>COBRANÇA</Text>
        <View style={[styles.cardCobranca, { backgroundColor: cardBackground }]}>
          <Text style={[styles.custosTitle, { color: text2 }]}>Custos</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#2A3147', marginVertical: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[styles.label, { color: tertiaryText }]}>Agendamento</Text>
              <Text style={{ color: tertiaryText, fontSize: 15 }}>{dataFormatada} às {selectedHorario}</Text>
            </View>
            <Text style={[styles.valor, { color: text2 }]}>{valorAgendamento}</Text>
          </View>
        </View>
      </Wrapper>
      <Modal
        visible={showRegulamento}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRegulamento(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={[styles.modalContainer, { backgroundColor: cardBackground }]}>
            <Text style={[styles.modalTitle, { color: text2 }]}>Informações</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              <Text style={{ fontSize: 15, color: tertiaryText }}>{regulamento ? regulamento : 'Nenhum regulamento disponível.'}</Text>
            </ScrollView>
            <TouchableOpacity
              style={{
                marginTop: 24,
                alignSelf: 'center',
                backgroundColor: '#F472B6',
                borderRadius: 16,
                paddingHorizontal: 32,
                paddingVertical: 10,
                width: '100%',
              }}
              onPress={() => setShowRegulamento(false)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardResumo: {
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 8,
    marginBottom: 18,
    elevation: 2,
  },
  cardCobranca: {
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 8,
    marginBottom: 18,
    elevation: 2,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontWeight: '400',
    fontSize: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cobrancaTitle: {
    fontWeight: '400',
    fontSize: 13,
    marginLeft: 18,
    marginBottom: 4,
    marginTop: 2,
    letterSpacing: 1,
  },
  custosTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  valor: {
    fontWeight: '600',
    fontSize: 15,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  fakeCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#F472B6',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#F472B6',
    borderColor: '#F472B6',
  },
});