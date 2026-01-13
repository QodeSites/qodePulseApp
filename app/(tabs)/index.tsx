import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { pyapi } from '@/api/axios';
import { useUser } from '@/context/UserContext';

export default function HomePage() {
  const { user, setUser, isAuthenticated } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setApiError(null);
      try {
        const res = await pyapi.get('/me'); 
        console.log(res,"=====================res")
        setMessage(res.data.message || 'Hello from API!');
      } catch (err: any) {
        setApiError('Failed to fetch greeting from API.');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to QodePulse</Text>
      <Text style={styles.subtitle}>
        {/* user may be null! */}
        {user?.email ? user.email + '\n' : ''}
        This is your home page. Use the tabs below to navigate through the app.
      </Text>
      <Text style={styles.info}>
        {loading && 'Loading greeting from API...'}
        {apiError && apiError}
        {!loading && !apiError && message && `${message}\n\n`}
        Start exploring features or check out other sections using the navigator.
      </Text>
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
  subtitle: {
    fontSize: 18,
    color: '#345',
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: '#678',
    textAlign: 'center',
    marginBottom: 40,
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