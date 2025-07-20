import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';

// Definindo o tipo esperado para o parâmetro da rota
interface Dependent {
  NOME: string;
  TITULO: string;
  AVATAR?: string;
}

type RouteParams = {
  dependent: Dependent;
};

export default function DependentDetails() {
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const dependent = (route.params as RouteParams)?.dependent;

  if (!dependent) {
    return (
      <View style={styles.centered}>
        <Text>Dependente não encontrado.</Text>
      </View>
    );
  }

  return (
    <>
      <Header title="Perfil" />
      <Wrapper style={styles.container}>
        <View style={styles.profileSection}>
          {dependent.AVATAR ? (
            <Image source={{ uri: dependent.AVATAR }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
        <Text style={styles.name}>{dependent.NOME}</Text>
        <Text style={styles.titulo}>{dependent.TITULO}</Text>
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Dados pessoais</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Calendário</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Inscrições</Text>
          </TouchableOpacity>
        </View>
      </Wrapper>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  editText: {
    color: '#e91e63',
    fontWeight: 'bold',
    marginTop: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#11153a',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 18,
    color: '#11153a',
    marginBottom: 32,
  },
  menu: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 18,
    color: '#11153a',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});