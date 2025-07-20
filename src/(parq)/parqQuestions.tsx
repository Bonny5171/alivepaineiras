import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { listarPerguntasParq, PerguntaParq } from '@/api/app/parq';
import { useThemeColor } from '@/hooks/useThemeColor';
import AssociateAvatar from '@/components/AssociateAvatar';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { unicodeToChar } from '@/api/app/appTransformer';

export default function ParqQuestions({ route }: any) {
  const navigation = useNavigation();
  const usuario = route?.params?.usuario;
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [perguntas, setPerguntas] = useState<PerguntaParq[]>([]);
  const [imageUrl, setImages] = useState();
  const [answers, setAnswers] = useState<(null | boolean)[]>([]);
  const [loading, setLoading] = useState(true);

  const background = useThemeColor({}, 'background');
  const text2 = useThemeColor({}, 'text2');
  const text = useThemeColor({}, 'text');
  const lightPink = useThemeColor({}, 'lightPink');
  const brand = useThemeColor({}, 'brand');
  const buttonText = useThemeColor({}, 'buttonText');
  const contrastText = useThemeColor({}, 'contrastText');

  React.useEffect(() => {
    async function fetchQuestionsAndAnswers() {
      setLoading(true);
      try {
        const data = await listarPerguntasParq(usuario?.TITULO);

        const imageData = data[0].QUESTIONARIO.map(item => ({ url: item.IMAGEM }));
        setImages(imageData)

        const perguntas = data[0]?.QUESTIONARIO || [];
        setPerguntas(perguntas);
        setQuestions(perguntas.map((q: PerguntaParq) => q.PERGUNTA));
        // Sempre inicia com respostas em branco
        const initialAnswers = Array(perguntas.length).fill(null);
        setAnswers(initialAnswers);
      } catch (e) {
        setPerguntas([]);
        setQuestions([]);
        setAnswers([]);
      }
      setLoading(false);
    }
    fetchQuestionsAndAnswers();
  }, []);

  const handleAnswer = (value: boolean) => {
    const newAnswers = [...answers];
    newAnswers[current] = value;
    setAnswers(newAnswers);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      (navigation as any).navigate('parqConfirm', { usuario, answers: newAnswers, perguntas });
    }
  };
console.log('>>>> usuario', usuario)
  return (
    <>
      <Header title="PAR-Q" />

      {
        !started
          ? (
              <View style={styles.bannerParq}>
                <Image
                  source={require('@/assets/images/parq0.jpg')}
                  style={styles.bannerImgParq}
                  resizeMode="contain"
                />
              </View>
            )
          : (
              <View style={styles.bannerParq}>
                <Image
                  source={{ uri: imageUrl[current].url }}
                  style={styles.bannerImgParq}
                  resizeMode="contain"
                />
              </View>
            )
      }

      <Wrapper
        style={[styles.container, { backgroundColor: background }]}
        useScrollView
        isLoading={loading}
        primaryButtonLabel={!started ? 'Começar' : undefined}
        onPrimaryPress={!started ? () => setStarted(true) : undefined}
      >
        {!started ? (
          <>
            <View style={styles.associadoContainer}>
              <Text style={[styles.associadoLabel, { color: text2 }]}>ASSOCIADO:</Text>
              {usuario.icon && usuario.icon.startsWith('http') ? (
                    <Image source={{ uri: usuario.icon }} style={styles.avatar} />
                ) : usuario.icon ? (
                    <>
                        {!usuario.icon.startsWith("U+") &&
                            <View style={{
                              display: 'flex',
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "#D034811A",
                              height: 40,
                              width: 40,
                              borderRadius: 10,
                              marginRight: 10
                            }}>
                                <IconSymbol color={brand} name={usuario.icon} size={20} library={usuario.iconLibrary} ></IconSymbol>
                            </View>}
                        {usuario.icon.startsWith("U+") &&
                            <ThemedView>
                                <ThemedText>{unicodeToChar(usuario.icon)}</ThemedText>
                            </ThemedView>}
                    </>
                ) : usuario.showName && usuario.altText ? (
                    <View style={{
                        width: 45,
                        height: 45,
                        borderRadius: 30,
                        backgroundColor: '#bbb',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textTransform: 'uppercase' }}>{usuario.altText.slice(0,2)}</ThemedText>
                    </View>
                ) : null}
              <Text style={[styles.associadoName, { color: text }]}>{usuario?.NOME}</Text>
            </View>
            <Text style={[styles.instructionText, { color: text2 }]}>
              Este questionário visa identificar a necessidade de avaliação por um médico antes do início da prática de atividade física. Caso você responda “SIM” a uma ou mais perguntas, converse com seu médico antes de aumentar seu nível atual de atividade física.
            </Text>
            <Text style={[styles.boldInstructionText, { color: text2 }]}>
              Leia com atenção e por favor, assinale “SIM” ou “NÃO” às perguntas.
            </Text>
            <Text style={[styles.boldInstructionText, { color: text2 }]}>
              Clique em “Começar” para dar início.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                disabled={current === 0}
                onPress={() => setCurrent(current - 1)}
                style={[styles.navButton, { opacity: current === 0 ? 0.3 : 1 }]}
              >
                <IconSymbol
                  name="arrow-left"
                  size={32}
                  color={text2}
                />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={answers[current] === null || current === questions.length - 1}
                onPress={() => setCurrent(current + 1)}
                style={[styles.navButton, { opacity: answers[current] === null ? 0.3 : 1 }]}
              >
                <IconSymbol
                  name="arrow-right"
                  size={32}
                  color={text2}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.questionNumber, { color: text2 }]}>Pergunta {current + 1}</Text>
            <Text style={[styles.questionText, { color: text2 }]}>{questions[current]}</Text>
            <View style={styles.answerButtonsContainer}>
              <TouchableOpacity
                style={[styles.answerButton, { backgroundColor: answers[current] === true ? brand : lightPink }]}
                onPress={() => handleAnswer(true)}
              >
                <Text style={[styles.answerButtonText, { color: answers[current] === true ? contrastText : buttonText }]}>
                  Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerButton, { backgroundColor: answers[current] === false ? brand : lightPink }]}
                onPress={() => handleAnswer(false)}
              >
                <Text style={[styles.answerButtonText, { color: answers[current] === false ? contrastText : buttonText }]}>
                  Não
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Wrapper>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  associadoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 22,
  },
  associadoLabel: {
    fontSize: 16,
    // marginRight: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 8,
  },
  associadoName: {
    fontSize: 16,
  },
  instructionText: {
    fontSize: 18,
    marginBottom: 20,
  },
  boldInstructionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 30,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'left',
  },
  answerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 16,
  },
  answerButton: {
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 60,
    marginHorizontal: 8,
  },
  answerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerParq: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  bannerImgParq: {
    width: '100%',
    height: '100%',
  }
});