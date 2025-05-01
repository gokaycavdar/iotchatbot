import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DashboardScreen = () => {
  const data = {
    temperature: 23.7,
    smokeLevel: 0.2,
    fireDetected: false,
    lastUpdate: '2025-04-24 18:30',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔥 Fire & Smoke Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>🌡️ Temperature</Text>
        <Text style={styles.value}>{data.temperature} °C</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>💨 Smoke Level</Text>
        <Text style={[styles.value, { color: data.smokeLevel > 70 ? 'red' : 'green' }]}>
          {data.smokeLevel} %
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🔥 Fire Status</Text>
        <Text style={[styles.value, { color: data.fireDetected ? 'red' : 'green' }]}>
          {data.fireDetected ? 'FIRE DETECTED' : 'Safe'}
        </Text>
      </View>

      <Text style={styles.time}>Last Updated: {data.lastUpdate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
  },
  label: { fontSize: 16, color: '#888' },
  value: { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  time: { marginTop: 20, textAlign: 'center', color: '#999' },
});

export default DashboardScreen;
