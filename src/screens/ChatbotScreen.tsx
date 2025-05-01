import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GEMINI_API_KEY } from '@env';

const ChatbotScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, `👤: ${userMessage}`]);
    setInput('');

    const mockSensorData = {
      temperature: 21.2,
      smokeLevel: 0.2,
      fireDetected: false,
      lastUpdate: '2025-04-24 18:30',
    };

    const fullPrompt = `
Sensör verileri:
- Sıcaklık: ${mockSensorData.temperature} °C
- Duman seviyesi: ${mockSensorData.smokeLevel}%
- Yangın algılandı mı: ${mockSensorData.fireDetected ? 'Evet' : 'Hayır'}
- Son güncelleme: ${mockSensorData.lastUpdate}

Kullanıcı sordu: ${userMessage}
Şu anda bir yangın tespit projesi için cevap vermen gerekiyor. Veriler ESP32 ile toplanıyor. Cevabın bu context içerisinde olsun. Cevaplarını kısa tut. Bu konudan alakasız bir soru gelirse bu konuda cevap veremeyeceğini söyle.
`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        }),
      });

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '(no reply)';
      setMessages(prev => [...prev, `🤖: ${reply}`]);
    } catch (error) {
      setMessages(prev => [...prev, `🤖: Hata oluştu: ${error}`]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatArea}>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>{msg}</Text>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Sensör verisine göre sor..."
          value={input}
          onChangeText={setInput}
        />
        <Pressable onPress={sendMessage} style={styles.sendButton}>
        <MaterialIcons name="send" size={24} color="white" />

        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  chatArea: { flex: 1, marginBottom: 10 },
  message: { backgroundColor: '#eee', padding: 10, borderRadius: 8, marginVertical: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: 'white',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 50,
  },
});

export default ChatbotScreen;
