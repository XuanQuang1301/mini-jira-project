import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

// Thay đổi URL API phù hợp với IP máy tính của bạn khi chạy trên thiết bị thật/emulator
const API_URL = 'http://10.0.2.2:5000/api'; // 10.0.2.2 dành cho Android Emulator

export default function App() {
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [projectsCount, setProjectsCount] = useState<number>(0);

  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    setLoading(true);
    try {
      // Gọi thử API health hoặc auth
      const response = await axios.get(`${API_URL}/users`, { timeout: 3000 });
      if (response.status === 200 || response.status === 401) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      // Ngay cả khi 401 Unauthorized thì backend vẫn phản hồi tốt
      if (axios.isAxiosError(error) && error.response) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mini Jira Mobile</Text>
          <Text style={styles.headerSubtitle}>Quản lý công việc Agile/Kanban</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            serverStatus === 'online' ? styles.badgeOnline : styles.badgeOffline,
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {serverStatus === 'online' ? '🟢 Connected' : '🔴 Offline'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Banner Welcome */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Phân hệ Mobile App</Text>
          <Text style={styles.cardDesc}>
            Chào mừng bạn đến với ứng dụng di động Mini Jira! Hệ thống đã được tích hợp thành công vào cấu trúc Monorepo (`apps/mobile`).
          </Text>

          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={checkServerConnection}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Kiểm tra kết nối Backend</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <Text style={styles.sectionTitle}>Tổng quan dự án & Công việc</Text>
        <View style={styles.gridContainer}>
          <View style={[styles.statBox, { backgroundColor: '#1e293b' }]}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Công việc của tôi</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.statNumber, { color: '#3b82f6' }]}>5</Text>
            <Text style={styles.statLabel}>Đang làm (In Progress)</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.statNumber, { color: '#eab308' }]}>3</Text>
            <Text style={styles.statLabel}>Chờ duyệt (In Review)</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.statNumber, { color: '#22c55e' }]}>4</Text>
            <Text style={styles.statLabel}>Hoàn thành (Done)</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>⚙️ Hướng dẫn phát triển Mobile</Text>
          <Text style={styles.cardDesc}>
            • Để mở ứng dụng trên thiết bị thật, cài ứng dụng Expo Go trên Android / iOS.{"\n"}
            • Chạy lệnh <Text style={{ fontFamily: 'monospace', color: '#60a5fa' }}>npm run mobile</Text> ở thư mục gốc để khởi động Expo bundler.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeOnline: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: '48%',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
});
