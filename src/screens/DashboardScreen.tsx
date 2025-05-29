import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Vibration, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const DashboardScreen = () => {
  const [data, setData] = useState({
    co_avg: 0,
    elec_avg: 0,
    gas_avg: 0,
    temp_avg: 0,
    timestamp: '',
  });

  const [isAnomaly, setIsAnomaly] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('test_sensor_data')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot(snapshot => {
        const doc = snapshot.docs[0];
        const data = doc?.data();
        if (data) {
          setData({
            temp_avg: data.temp_avg ?? 0,
            gas_avg: data.gas_avg ?? 0,
            co_avg: data.co_avg ?? 0,
            elec_avg: 600 ?? 0,
            timestamp: data.timestamp?.toDate().toLocaleString() ?? '',
          });
        } else {
          console.log('❌ Veri bulunamadı.');
        }
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribeAnomalies = firestore()
      .collection('test_anomalies')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot(snapshot => {
        const doc = snapshot.docs[0];
        const data = doc?.data();
        if (data) {
          console.log('📛 Yeni anomali geldi:', data);
          Vibration.vibrate([0, 1000, 500, 1000], false);
          setIsAnomaly(true);
        }
      });

    return () => unsubscribeAnomalies();
  }, []);

  return (
    <View style={[styles.container, isAnomaly && styles.alertContainer]}>
      <Text style={styles.header}>🔥 Fire & Smoke Dashboard</Text>

      {isAnomaly && (
        <View style={styles.anomalyAlert}>
          <Text style={styles.anomalyText}>🚨 Tehlike Tespit Edildi! Elektrik Seviyesi Çok Yüksek</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>🌡️ Temperature</Text>
        <Text style={styles.value}>{data.temp_avg} °C</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>💨 CO Avg</Text>
        <Text style={styles.value}>{data.co_avg}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>⚡ Electricity Avg(A)</Text>
        <Text style={styles.value}>{data.elec_avg}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🧪 Gas Avg(CH4 ppm)</Text>
        <Text style={styles.value}>{data.gas_avg}</Text>
      </View>

      <Text style={styles.time}>Last Updated: {data.timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  alertContainer: { backgroundColor: '#ffcccc' },
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
  anomalyAlert: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  anomalyText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DashboardScreen;
