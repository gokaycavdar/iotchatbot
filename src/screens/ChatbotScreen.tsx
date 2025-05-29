import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GEMINI_API_KEY } from '@env';
import firestore from '@react-native-firebase/firestore';

const ChatbotScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [sensorData, setSensorData] = useState({
    temp_avg: 0,
    gas_avg: 0,
    co_avg: 0,
    elec_avg: 0,
    timestamp: '',
  });

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('test_sensor_data') // ✅ DÜZENLENDİ
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot(snapshot => {
        const doc = snapshot.docs[0];
        const data = doc?.data();
        if (data) {
          setSensorData({
            temp_avg: data.temp_avg ?? 0,
            gas_avg: data.gas_avg ?? 0,
            co_avg: data.co_avg ?? 0,
            elec_avg: data.elec_avg ?? 0,
            timestamp: data.timestamp?.toDate().toLocaleString('tr-TR') ?? '',
          });
        } else {
          console.log('❌ Sensör verisi bulunamadı.');
        }
      });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, `👤: ${userMessage}`]);
    setInput('');

    const fullPrompt = `
Son sensör verileri:
- Sıcaklık: ${sensorData.temp_avg} °C
- Gaz seviyesi: ${sensorData.gas_avg} ppm
- Karbonmonoksit (CO): ${sensorData.co_avg} ppm
- Elektrik seviyesi: ${sensorData.elec_avg} V
- Son güncelleme: ${sensorData.timestamp}

Kullanıcı şunu sordu: ${userMessage}
Normal voltaj aralığı 248-247
gaz metan/propan gazı
Lütfen ESP32 ile toplanan bu veriler bağlamında cevap ver. Eğer alakasız bir soruysa bunu belirt.
`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
        }
      );

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
