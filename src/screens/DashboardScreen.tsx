import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Vibration, Platform, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

type SensorData = {
  co_avg: number;
  elec_avg: number;
  gas_avg: number;
  temp_avg: number;
  timestamp: string;
};

// Add this type for anomaly info (customize fields as needed)
type AnomalyInfo = {
  [key: string]: any; // or define specific fields if you know them
  timestamp?: any;
};

const DashboardScreen = () => {
  const [data, setData] = useState<SensorData>({
    co_avg: 0,
    elec_avg: 0,
    gas_avg: 0,
    temp_avg: 0,
    timestamp: '',
  });

  const [isAnomaly, setIsAnomaly] = useState(false);
  const [anomalyInfo, setAnomalyInfo] = useState<AnomalyInfo | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyInfo[]>([]);

  const lastAnomalyTimestampRef = useRef<number | null>(null);

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
            elec_avg: data.elec_avg ?? 0,
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
      .limit(10)
      .onSnapshot(snapshot => {
        const newAnomalies: AnomalyInfo[] = snapshot.docs.map(doc => doc.data());
        setAnomalies(newAnomalies);
        if (newAnomalies.length > 0) {
          const latest = newAnomalies[0];
          const latestTimestamp = latest.timestamp?.seconds;
          // Only trigger warning if the latest anomaly is new (not on initial load)
          if (
            latestTimestamp &&
            lastAnomalyTimestampRef.current !== null &&
            latestTimestamp !== lastAnomalyTimestampRef.current
          ) {
            Vibration.vibrate([0, 1000, 500, 1000], false);
            setIsAnomaly(true);
            setAnomalyInfo(latest);
          }
          // Always update the ref to the latest timestamp
          lastAnomalyTimestampRef.current = latestTimestamp;
        }
      });

    return () => unsubscribeAnomalies();
  }, []);

  useEffect(() => {
    if (isAnomaly) {
      const timer = setTimeout(() => {
        setIsAnomaly(false);
        setAnomalyInfo(null);
      }, 15000); // 15 seconds
      return () => clearTimeout(timer);
    }
  }, [isAnomaly]);

  return (
    <View style={{ flex: 1, backgroundColor: isAnomaly ? '#ffcccc' : '#f2f2f2' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.header}>🔥 Fire & Smoke Dashboard</Text>
  
        {isAnomaly && (
          <View style={styles.anomalyAlert}>
            <Text style={styles.anomalyText}>🚨 Tehlike Tespit Edildi!</Text>
            {anomalyInfo && (
              <View>
                {anomalyInfo.type && (
                  <Text style={styles.anomalyText}>Tip: {anomalyInfo.type}</Text>
                )}
                {anomalyInfo.timestamp && (
                  <Text style={styles.anomalyText}>
                    Zaman: {anomalyInfo.timestamp.toDate?.().toLocaleString?.()}
                  </Text>
                )}
                {typeof anomalyInfo.temp_avg !== 'undefined' && (
                  <Text style={styles.anomalyText}>🌡️ Sıcaklık: {anomalyInfo.temp_avg} °C</Text>
                )}
                {typeof anomalyInfo.co_avg !== 'undefined' && (
                  <Text style={styles.anomalyText}>💨 CO: {anomalyInfo.co_avg}</Text>
                )}
                {typeof anomalyInfo.elec_avg !== 'undefined' && (
                  <Text style={styles.anomalyText}>⚡ Elektrik: {anomalyInfo.elec_avg}</Text>
                )}
                {typeof anomalyInfo.gas_avg !== 'undefined' && (
                  <Text style={styles.anomalyText}>🧪 Gaz: {anomalyInfo.gas_avg}</Text>
                )}
              </View>
            )}
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
  
        <View style={styles.anomalyList}>
          <Text style={styles.anomalyListHeader}>Geçmiş Anomaliler</Text>
          {anomalies.length === 0 && (
            <Text style={styles.anomalyListEmpty}>Hiç anomali yok.</Text>
          )}
          {anomalies.map((anomaly, idx) => (
            <View key={idx} style={styles.anomalyListItem}>
              {anomaly.type && (
                <Text style={styles.anomalyListText}>Tip: {anomaly.type}</Text>
              )}
              {anomaly.timestamp && (
                <Text style={styles.anomalyListText}>
                  Zaman: {anomaly.timestamp.toDate?.().toLocaleString?.()}
                </Text>
              )}
              <Text style={styles.anomalyListText}>
                🌡️ Sıcaklık: {typeof anomaly.temp_avg !== 'undefined' ? `${anomaly.temp_avg} °C` : '-'}
              </Text>
              <Text style={styles.anomalyListText}>
                💨 CO: {typeof anomaly.co_avg !== 'undefined' ? anomaly.co_avg : '-'}
              </Text>
              <Text style={styles.anomalyListText}>
                ⚡ Elektrik: {typeof anomaly.elec_avg !== 'undefined' ? anomaly.elec_avg : '-'}
              </Text>
              <Text style={styles.anomalyListText}>
                🧪 Gaz: {typeof anomaly.gas_avg !== 'undefined' ? anomaly.gas_avg : '-'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  anomalyList: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
  },
  anomalyListHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#d32f2f',
  },
  anomalyListEmpty: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  anomalyListItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  anomalyListText: {
    color: '#333',
    fontSize: 14,
  },
});

export default DashboardScreen;
