import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Wrapper } from '@/components/Wrapper';
import { Atividade, unicodeToChar } from '@/api/app/appTransformer';
import { exibirDetalhes, programarExclusao } from '@/api/app/atividades';
import { Image, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useError } from '@/providers/ErrorProvider';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useNavigation, useRoute } from '@react-navigation/native';

const ActivityDetail: React.FC<any> = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [atividade, setAtividade] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setError } = useError();
  const confirm = useConfirmation();

  const backgroundColor = useThemeColor({}, 'background');
  const activeBackground = useThemeColor({}, 'activeBackground');

  useEffect(() => {
    setIsLoading(true);
    const atividadeNavegacao = JSON.parse(route.params?.atividade as string) as Atividade;
    exibirDetalhes({
      TITULO: atividadeNavegacao.TITULO,
      IDATIVIDADE: atividadeNavegacao.IDATIVIDADE,
      IDTURMA: atividadeNavegacao.TURMA,
    }).then((response) => {
      const atividadeCompleta = {
        ...atividadeNavegacao,
        ...response
      };
      setAtividade(atividadeCompleta);
    }).catch((error) => {
      console.error('Erro ao buscar dados:', error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleCancel = () => {
    confirm.showConfirmation('Cancelar Matrícula', handleCancelConfirmation);
  }

  const handleCancelConfirmation = async () => {
    programarExclusao({
      TITULO: atividade.TITULO,
      IDATIVIDADE: atividade.IDATIVIDADE,
      IDTURMA: atividade.TURMA,
    }).then(() => {
      setError('Matrícula cancelada com sucesso!', 'success');
      navigation.goBack();
    }).catch((error) => {
      setError('Erro ao cancelar matrícula', 'error');
      console.error('Erro ao cancelar matrícula:', error);
    });
  }

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      padding: 16,
    },
    avatar: {
      width: 55,
      height: 55,
      borderRadius: 30,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    associated: {
      fontSize: 18,
      marginBottom: 16,
    },
    infoContainer: {
      width: '100%',
      backgroundColor: activeBackground,
      padding: 16,
      borderRadius: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      backgroundColor: activeBackground,
    },
    infoLabel: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 'bold',
      backgroundColor: activeBackground,
    },
    infoValue: {
      fontSize: 14,
      lineHeight: 20,
      backgroundColor: activeBackground,
    },
    iconContainer: {
      backgroundColor: activeBackground,
      width: 90,
      height: 90,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 50,
      marginBottom: 20,
    },
    iconText: {
      fontSize: 30,
      lineHeight: 50,
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    associatedContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginBottom: 16,
      gap: 8,
    },
  });

  return (
    <Wrapper
      isLoading={isLoading}
      primaryButtonLabel={atividade?.TRANSFERIR ? 'Trocar De Turma' : undefined}
      secondaryButtonLabel={atividade?.CANCELAR ? 'Cancelar Matrícula' : undefined}
      onPrimaryPress={atividade?.TRANSFERIR ? () => console.log('Transferir') : undefined}
      onSecondaryPress={atividade?.CANCELAR ? handleCancel : undefined}
    >
      {atividade &&
        <ThemedView style={styles.container}>
          <ThemedView style={styles.iconContainer}>
            <ThemedText style={styles.iconText}>{unicodeToChar(atividade.ICONE)}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.title}>{atividade.ATIVIDADE}</ThemedText>
          <ThemedView style={styles.associatedContainer}>
            <ThemedText style={styles.associated}>Associado matriculado: </ThemedText>
            <Image source={{ uri: atividade.AVATAR }} style={styles.avatar} />
          </ThemedView>
          <ThemedView style={styles.infoContainer}>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Dia(s):</ThemedText>
              <ThemedText style={styles.infoValue}>{atividade.DIAS}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Horário:</ThemedText>
              <ThemedText style={styles.infoValue}>{atividade.HORARIO}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Local:</ThemedText>
              <ThemedText style={styles.infoValue}>{atividade.LOCAL}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Professor:</ThemedText>
              <ThemedText style={styles.infoValue}>{atividade.PROFESSOR}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Custo Mensal:</ThemedText>
              <ThemedText style={styles.infoValue}>R$ {atividade.VALOR_MENSAL}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Tipo de Cobrança:</ThemedText>
              <ThemedText style={styles.infoValue}>{atividade.TIPO_COBRANCA}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      }
    </Wrapper>
  );
};

export default ActivityDetail;