import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function ChirashiImageModal({ visible, onClose }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setImageUri(null);
    setImageBase64(null);
    setSuggestion(null);
    setError(null);
    onClose();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('写真へのアクセス許可が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1.0,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    // 5MB制限対策: 長辺1500px・品質0.75でリサイズ圧縮
    const compressed = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1500 } }],
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    setImageUri(compressed.uri);
    setImageBase64(compressed.base64 ?? null);
    setMimeType('image/jpeg');
    setSuggestion(null);
    setError(null);
  };

  const fetchSuggestion = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/meal-suggestion/from-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64, media_type: mimeType }),
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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.emoji}>📰</Text>
            <View>
              <Text style={styles.headerTitle}>チラシから献立提案</Text>
              <Text style={styles.headerSub}>チラシのスクショを選んでください</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>チラシから献立を考えています…</Text>
          </View>
        ) : suggestion ? (
          <ScrollView contentContainerStyle={styles.scroll}>
            {sections.map((section, i) => (
              <View key={i} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setSuggestion(null); setImageUri(null); setImageBase64(null); }}>
              <Text style={styles.resetText}>別の画像で試す</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.centered}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                {error && <Text style={styles.errorText}>{error}</Text>}
                <TouchableOpacity style={styles.primaryBtn} onPress={fetchSuggestion}>
                  <Text style={styles.primaryBtnText}>献立を提案する</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                  <Text style={styles.secondaryBtnText}>画像を選び直す</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.placeholderIcon}>
                  <Ionicons name="image-outline" size={64} color="#CCC" />
                </View>
                <Text style={styles.placeholderText}>
                  チラシのスクリーンショットを{'\n'}フォトライブラリから選んでください
                </Text>
                {error && <Text style={styles.errorText}>{error}</Text>}
                <TouchableOpacity style={styles.primaryBtn} onPress={pickImage}>
                  <Ionicons name="images-outline" size={18} color="#FFF" />
                  <Text style={styles.primaryBtnText}>フォトライブラリを開く</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
    padding: 32,
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  preview: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryBtn: {
    paddingVertical: 10,
  },
  secondaryBtnText: {
    color: '#999',
    fontSize: 13,
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  resetText: {
    color: '#999',
    fontSize: 13,
  },
});
