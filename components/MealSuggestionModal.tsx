import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../types';

interface Props {
  store: Store;
  visible: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_BASE_URL) throw new Error('EXPO_PUBLIC_API_URL is not set');

export default function MealSuggestionModal({ store, visible, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setSuggestion(null);
    setError(null);
    fetchSuggestion();
  }, [visible]);

  const fetchSuggestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/meal-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: store.name,
          deals: store.deals.map((d) => ({ title: d.title, summary: d.summary })),
        }),
      });
      if (!res.ok) throw new Error('献立の取得に失敗しました');
      const data = await res.json();
      setSuggestion(data.suggestion);
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const sections = suggestion
    ? suggestion.split(/^##\s+/m).filter(Boolean).map((s) => {
        const [title, ...body] = s.split('\n');
        return { title: title.trim(), body: body.join('\n').trim() };
      })
    : [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.emoji}>🍽️</Text>
            <View>
              <Text style={styles.headerTitle}>献立の提案</Text>
              <Text style={styles.headerSub}>{store.name}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>特売品から献立を考えています…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchSuggestion}>
              <Text style={styles.retryText}>再試行</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {sections.map((section, i) => (
              <View key={i} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#999',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});
