import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface AgendamentoModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (params: { date: string, hour: string }) => void;
}

export default function AgendamentoModal({ visible, onClose, onConfirm }: AgendamentoModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  // Obter a data atual no formato YYYY-MM-DD
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  const horariosDisponiveis = ['07h00', '08h00', '09h00', '10h00', '11h00'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { maxHeight: screenHeight * 0.45, height: 380 }]}>
          <ScrollView showsVerticalScrollIndicator={true}>
            <Text style={styles.title}>Escolha a data</Text>

            <Calendar
              onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
              markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#D53F8C' } } : {}}
              theme={{
                todayTextColor: '#D53F8C',
                selectedDayBackgroundColor: '#D53F8C',
                selectedDayTextColor: '#fff',
                'stylesheet.calendar.main': {
                  week: {
                    marginTop: 0,
                    marginBottom: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-around'
                  }
                },
                'stylesheet.day.basic': {
                  base: {
                    width: 20,
                    height: 20,
                    alignItems: 'center'
                  },
                  text: {
                    fontSize: 12,
                    marginTop: 2
                  }
                },
                'stylesheet.calendar.header': {
                  header: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingLeft: 10,
                    paddingRight: 10,
                    marginTop: 0,
                    alignItems: 'center',
                    height: 30
                  },
                  monthText: {
                    fontSize: 14,
                    fontWeight: 'bold'
                  },
                  dayHeader: {
                    fontSize: 12,
                    marginTop: 2,
                    marginBottom: 2,
                    color: '#727582',
                    fontWeight: '500'
                  }
                }
              }}
              minDate={minDate}
              style={{ height: 240, width: screenWidth * 0.85 }}
            />

            {selectedDate && (
              <View>
                <Text style={styles.subTitle}>Escolha o horário</Text>
                <View style={styles.hoursContainer}>
                  {horariosDisponiveis.map((hora, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.hourBox, selectedHour === hora && styles.hourBoxSelected]}
                      onPress={() => setSelectedHour(hora)}
                    >
                      <Text style={{ color: selectedHour === hora ? '#fff' : '#1A202C' }}>{hora}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={[styles.button, { backgroundColor: '#EDF2F7' }]} onPress={onClose}>
              <Text style={{ color: '#D53F8C' }}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: '#D53F8C' }]}
              onPress={() => {
                if (selectedDate && selectedHour) {
                  onConfirm({ date: selectedDate, hour: selectedHour });
                }
              }}
              disabled={!selectedDate || !selectedHour}
            >
              <Text style={{ color: '#fff' }}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '45%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A202C',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
    marginBottom: 8,
  },
  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hourBoxSelected: {
    backgroundColor: '#D53F8C',
    borderColor: '#D53F8C',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
