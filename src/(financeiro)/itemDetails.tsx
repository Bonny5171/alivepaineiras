import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Wrapper } from '@/components/Wrapper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { unicodeToChar } from '@/api/app/appTransformer';
import { StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useError } from '@/providers/ErrorProvider';
import { useConfirmation } from '@/providers/ConfirmProvider';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';

const ContestationDetail: React.FC<any> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setError } = useError();
  const confirm = useConfirmation();

  const backgroundColor = useThemeColor({}, 'background');
  const activeBackground = useThemeColor({}, 'activeBackground');
  
  const formatDate = (dateString: string) => {
    try {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      return `${day}/${month}/${year} às ${hour}h${minute}`;
    } catch (error) {
      console.error('Erro ao formatar a data:', error);
      return dateString;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const itemNavegacao = JSON.parse(route.params?.item as string);
    setItem(itemNavegacao);
    setIsLoading(false);
  }, [route.params]);


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
      marginBottom: 10,
      backgroundColor: activeBackground,
    },
    infoLabel: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: 400,
      backgroundColor: activeBackground,
    },
    infoValue: {
      fontSize: 14,
      lineHeight: 18,
      backgroundColor: activeBackground,
      maxWidth: '70%',
    },
    iconContainer: {
      backgroundColor: "#D034811A",
      width: 90,
      height: 90,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 15,
      marginBottom: 0,
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
      primaryButtonLabel="Contestar Cobrança"
      onPrimaryPress={() => 
        navigation.navigate('(manifest)/newText', {
          data: item.DATA,
          motivo: 3,
          grupo: item.GRUPO,
          taxa: item.TAXA,
        })
      }
    >
      <Header title={item?.GRUPO}/>
      {item &&
        <ThemedView style={styles.container}>
          <ThemedView style={styles.iconContainer}>
            <ThemedText style={styles.iconText}><IconSymbol name={"sack-dollar"} color={"#DA1984"} size={40}/></ThemedText>
          </ThemedView>
          <ThemedText style={styles.title}>R$ {item.VALOR}</ThemedText>
          <ThemedView style={styles.infoContainer}>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Associado:</ThemedText>
              <ThemedText style={styles.infoValue}>{item.NOME}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Inserido em:</ThemedText>
              <ThemedText style={styles.infoValue}>{formatDate(item.DATA)}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Contexto:</ThemedText>
              <ThemedText style={styles.infoValue}>{item.TAXA}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      }
    </Wrapper>
  );
};

export default ContestationDetail;