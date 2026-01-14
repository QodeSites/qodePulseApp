import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { pyapi } from '@/api/axios';
import { useFocusEffect } from '@react-navigation/native';
// Import authEvents from the relevant location
import { authEvents } from '@/hooks/authEvents';

type UserData = {
  created_at: string;
  email: string;
  full_name: string;
  id: number;
  is_active: boolean;
  is_verified: boolean;
  username: string;
  uuid: string;
};

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Run fetchData every time the tab is focused using useFocusEffect
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchData() {
        setLoading(true);
        setApiError(null);
        try {
          const res = await pyapi.get('/auth/me'); 
          if (!isActive) return;
          setUserData(res.data.data);
          setMessage(res.data.message || 'Hello from API!');
        } catch (err: any) {
          if (!isActive) return;
          setApiError('Failed to fetch user details from API.');
        }
        if (!isActive) return;
        setLoading(false);
      }
      fetchData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Handler for logout button
  const handleLogout = () => {
    authEvents.logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to QodePulse</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {loading && (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <ActivityIndicator size="large" color="#567" />
          <Text style={styles.info}>Loading user details from API...</Text>
        </View>
      )}

      {apiError && (
        <Text style={styles.info}>{apiError}</Text>
      )}

      {!loading && !apiError && userData && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <Text style={styles.label}>
            <Text style={styles.field}>Full Name: </Text>
            {userData.full_name}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.field}>Username: </Text>
            {userData.username}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.field}>Email: </Text>
            {userData.email}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.field}>User ID: </Text>
            {userData.id}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.field}>UUID: </Text>
            {userData.uuid}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.field}>Created At: </Text>
            {new Date(userData.created_at).toLocaleString()}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.field}>Active: </Text>
            {userData.is_active ? "Yes" : "No"}
          </Text>
          <Text style={styles.label}>
            <Text style={styles.field}>Verified: </Text>
            {userData.is_verified ? "Yes" : "No"}
          </Text>
        </View>
      )}

      {!loading && !apiError && message && (
        <Text style={styles.info}>{message}</Text>
      )}

      <Text style={styles.footer}>
        © 2025 Qode Advisors LLP | SEBI Registered PMS No: INP000008914 | All Rights Reserved
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafcff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#224',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#223',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#0003',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#345',
    marginVertical: 2,
  },
  field: {
    fontWeight: 'bold',
    color: '#234',
  },
  info: {
    fontSize: 16,
    color: '#678',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  logoutButton: {
    position: 'absolute',
    top: 36,
    right: 24,
    backgroundColor: '#f33',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  footer: {
    fontSize: 11,
    color: '#789',
    textAlign: 'center',
    marginTop: 40,
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});