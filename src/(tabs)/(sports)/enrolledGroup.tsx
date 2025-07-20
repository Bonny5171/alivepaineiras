import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform, ActivityIndicator, Image } from 'react-native';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function FreeClassDetailsScreen({ route }: any) {
  const { TURMA, DATA } = route.params;

  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const text3Color = useThemeColor({}, 'text3');

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Header title={`Turma ${TURMA}`} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={[styles.card, { backgroundColor: background2 }]}>
          {DATA.map((item: any, index: number) => {
            const getInitials = () => {
              if (!item.NOME) return '';
              const nameParts = item.NOME.split(' ');
              if (nameParts.length > 1) {
                return `${nameParts[0][0]}${nameParts[1][0]}`;
              }
              return nameParts[0][0];
            };
            return (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: text2Color, fontWeight: '800' }}>{index + 1}.</Text>
              <View style={[styles.associateAvatar, { marginLeft: 6, backgroundColor: '#eee' }]}>
                {item.AVATAR ? (
                  <Image
                    resizeMode="contain"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    source={{ uri: item.AVATAR as string }}
                  />
                ) : (
                  <Text style={{ color: '#0F1C47', fontWeight: '800' }}>{getInitials()}</Text>
                )}
              </View>
              <Text style={{ marginLeft: 16, color: '#6f7791' }}>{item.NOME}</Text>
            </View>
          )
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  associateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#a3aac3",
    borderWidth: 2,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  iconContainer: { flexDirection: 'column', alignItems: 'center', marginRight: 16, alignSelf: 'flex-start' },
  iconCircle: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d6f9e6' },
  numberText: { fontSize: 22, fontWeight: 'bold', color: '#3eab7e' },
  vagasText: { fontSize: 12, color: '#636d8e', marginTop: 4 },
  sectionContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 0,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  titulo: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 4 },
  professorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  professor: { fontSize: 14, color: '#878da3' },
  horario: { fontSize: 14, color: '#878da3' },
  sectionTitle: { fontSize: 14, fontWeight: '400', marginBottom: 8, paddingHorizontal: 16, color: '#39456a' },
  descricao: { fontSize: 13, color: '#878da3', paddingHorizontal: 16, lineHeight: 23 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.select({
      ios: 30,
      android: 16,
    }),
    elevation: 5,
  },
  botao: {
    backgroundColor: '#F9D9EB',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  textoBotao: {
    color: '#D53F8C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toast: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: '#48BB78',
    padding: 16,
    borderRadius: 12,
  },
  toastTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1A202C',
  },
  toastMessage: {
    fontSize: 13,
    color: '#1A202C',
    marginTop: 4,
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
});