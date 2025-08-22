
<img width="1456" height="652" alt="diagram" src="https://github.com/user-attachments/assets/7766c27b-7b22-4bf9-8184-56d29eaac202" />

🔥 IoT Anomaly Detection System

📌 About the Project

This project was built on an ESP32 microcontroller and designed to detect anomalies from environmental sensor data. The goal was to explore real-time IoT data processing, anomaly detection with machine learning, and mobile app integration.

We developed the system on the Arduino platform and implemented it with RTOS (Real-Time Operating System) so that different tasks could run in a multithreaded manner.

The device collected data every 10 seconds from:

A temperature sensor

A methane gas sensor

For current measurement, instead of a physical sensor, We generated a sample dataset as a text file and read it directly from the ESP32’s flash memory.

An Edge Impulse ML model was trained for anomaly detection. When anomalies were detected, the results were sent to Firebase Firestore.

On the mobile side, We developed a React Native application that listens to Firestore. Whenever a new anomaly entry was written, the app triggered a real-time push notification to the user.

Apart from anomalies, every 5 minutes the system calculated the average values of normal readings and saved them in a separate Firestore collection. Using this dataset, I also integrated a chatbot powered by Gemini API, which allowed users to query and interact with their IoT data in a more intuitive way.

⚙️ Tech Stack

ESP32 (Arduino + RTOS)

Temperature Sensor + Methane Gas Sensor

Edge Impulse (Machine Learning for anomaly detection)

Firebase Firestore

React Native (mobile app)

Gemini API (chatbot integration)

🌟 Key Features

Real-time sensor data collection (temperature, methane gas, and simulated current data)

ML-based anomaly detection deployed on ESP32

Anomaly events sent to Firebase Firestore

Mobile app notifications via React Native

Data aggregation (5-minute averages) for historical tracking

Chatbot functionality with Gemini API for interactive data queries
