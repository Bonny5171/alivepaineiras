import { View, Text, Pressable, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gravarRespostasParq, PerguntaParq } from '@/api/app/parq';
import { useError } from '@/providers/ErrorProvider';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ParqConfirm() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { usuario, answers, perguntas } = route.params || {};
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setError } = useError();
  const confirm = useConfirmation();

  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const text2 = useThemeColor({}, 'text2');
  const text = useThemeColor({}, 'text');
  const neutralText = useThemeColor({}, 'neutralText');
  const border = useThemeColor({}, 'border');
  const shadow = useThemeColor({}, 'shadow');
  const highlight = useThemeColor({}, 'highlight');
  const highlightFaded = useThemeColor({}, 'highlightFaded');

  // Monta o resumo para exibir
  const respostasResumo = (perguntas || []).map((p: PerguntaParq, idx: number): { pergunta: string; resposta: string } => ({
    pergunta: p.PERGUNTA,
    resposta: answers && answers[idx] === true ? 'Sim' : answers && answers[idx] === false ? 'Não' : '-',
  }));

  // Monta o payload para a API
  const respostasApi = (perguntas || []).map((p: PerguntaParq, idx: number) => ({
    IDPERGUNTA: p.IDPERGUNTA,
    RESPOSTA: answers && typeof answers[idx] === 'boolean' ? answers[idx] : false,
    ORDEM: p.ORDEM,
  }));

  const handleConfirm = async () => {
    if (!checked) return;
    confirm.showConfirmation(
      'Confirmação',
      async () => {
        setLoading(true);
        try {
          await gravarRespostasParq(usuario?.TITULO, [{ QUESTIONARIO: respostasApi }]);
          setError('Respostas salvas com sucesso!', 'success');
          navigation.reset({
            index: 2,
            routes: [
              { name: '(tabs)' },
              { name: '(consulta)/index' },
              { name: 'parqList' },
            ] as any,
          });
        } catch (e) {
          setError('Erro ao salvar respostas. Tente novamente.', 'error');
        }
        setLoading(false);
      },
      {
        abovePasswordComponent: (
          <>
            <Text style={[styles.modalTitle, { color: text2 }]}>PAR-Q</Text>
            <Text style={[styles.modalSubtitle, { color: text }]}>Declaração de respostas do PAR-Q</Text>
          </>
        ),
      }
    );
  };

  return (
    <>
      <Header title="PAR-Q" />
      <Wrapper
        style={[styles.container, { backgroundColor: background }]}
        useScrollView
        primaryButtonLabel="Confirmar"
        onPrimaryPress={handleConfirm}
        isButtonLoading={loading}
        isPrimaryButtonDisabled={!checked}
      >
        {/* Card de resumo das perguntas */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: background2,
              shadowColor: shadow,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: text2 }]}>Resumo das perguntas</Text>
          <View style={[styles.cardDivider, { borderTopColor: border }]} />
          {respostasResumo.map((item: { pergunta: string; resposta: string }, idx: number) => (
            <View key={item.pergunta} style={styles.cardItem}>
              <Text style={[styles.cardQuestion, { color: text }]}>{item.pergunta}</Text>
              <Text
                style={[
                  styles.cardAnswer,
                  { color: item.resposta === 'Sim' ? text2 : neutralText },
                ]}
              >
                R: {item.resposta}
              </Text>
            </View>
          ))}
        </View>
        {/* Declaração */}
        <View style={styles.declarationContainer}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.declarationText, { color: text }]}>
              Estou ciente de que é recomendável consultar um médico antes de aumentar meu nível atual de atividade física, especialmente por ter respondido “SIM” a uma ou mais perguntas do Questionário de Prontidão para Atividade Física (PAR-Q). Assumo plena responsabilidade por qualquer atividade física praticada sem o atendimento a essa recomendação e declaro que as respostas fornecidas são verdadeiras.
            </Text>
            <View style={styles.checkboxContainer}>
              <Pressable
                onPress={() => setChecked(!checked)}
                style={[
                  styles.checkbox,
                  {
                    borderColor: checked ? highlight : text2,
                    backgroundColor: checked ? highlightFaded : 'transparent',
                  },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
              >
                {checked && (
                  <View
                    style={[styles.checkboxInner, { backgroundColor: highlight }]}
                  />
                )}
              </Pressable>
              <Text style={[styles.checkboxLabel, { color: text }]}>
                Declaro que li e concordo com o termo de responsabilidade.
              </Text>
            </View>
          </View>
        </View>
        {/* Data */}
        <Text style={[styles.dateText, { color: text2 }]}>
          Data: {new Date().toLocaleDateString('pt-BR')}
        </Text>
        {/* Observações */}
        <Text style={[styles.noteText, { color: text }]}>
          Salienta-se que a avaliação médica apresentada não substitui a avaliação física.
        </Text>
        <Text style={[styles.noteText, { color: text }]}>
          Avaliação física que deve ser realizada por um Profissional de Educação Física para determinar a carga adequada de exercícios.
        </Text>
      </Wrapper>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 12,
  },
  cardDivider: {
    borderTopWidth: 1,
    marginBottom: 4,
  },
  cardItem: {
    marginBottom: 18,
  },
  cardQuestion: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardAnswer: {
    fontWeight: '600',
    fontSize: 18,
    marginTop: 6,
    marginLeft: 8,
  },
  declarationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  declarationText: {
    fontSize: 16,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    marginRight: 12,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkboxLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});