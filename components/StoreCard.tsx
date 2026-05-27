import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../types';
import MealSuggestionModal from './MealSuggestionModal';

interface StoreCardProps {
  store: Store;
  onClose?: () => void;
  expanded?: boolean;
}

export default function StoreCard({ store, onClose, expanded = false }: StoreCardProps) {
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const distanceText =
    store.distance < 1000
      ? `${Math.round(store.distance)}m`
      : `${(store.distance / 1000).toFixed(1)}km`;

  const openUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.card, expanded && styles.cardExpanded]}>
      {expanded && <View style={styles.handleBar} />}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{store.categoryEmoji}</Text>
          </View>
          <View style={styles.storeText}>
            <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color="#999" />
              <Text style={styles.metaText}>{distanceText}</Text>
              {store.isOpen !== undefined && (
                <>
                  <View style={styles.dot} />
                  <Text style={[
                    styles.openStatus,
                    { color: store.isOpen ? '#34C759' : '#FF3B30' }
                  ]}>
                    {store.isOpen ? '営業中' : '営業時間外'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Deal Count Badge */}
        <View style={styles.dealBadge}>
          <Text style={styles.dealCount}>{store.dealCount}</Text>
          <Text style={styles.dealLabel}>特売</Text>
        </View>

        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Deals */}
      {store.deals.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dealScroll}
          contentContainerStyle={styles.dealScrollContent}
        >
          {store.deals.map((deal, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dealItem}
              onPress={() => openUrl(deal.url)}
              activeOpacity={0.8}
            >
              <Text style={styles.dealTitle} numberOfLines={1}>
                {deal.title ?? store.name}
              </Text>
              <Text style={styles.dealSummary} numberOfLines={4}>
                {deal.summary}
              </Text>
              <View style={styles.dealLink}>
                <Ionicons name="open-outline" size={11} color="#FF6B35" />
                <Text style={styles.dealLinkText}>詳細を見る</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noDeal}>
          <Text style={styles.noDealText}>特売情報なし</Text>
        </View>
      )}

      {!expanded && (
        <View style={styles.actionRow}>
          {store.website && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => openUrl(store.website!)}
            >
              <Text style={styles.viewMoreText}>店舗サイトを見る</Text>
              <Ionicons name="open-outline" size={14} color="#FF6B35" />
            </TouchableOpacity>
          )}
          {store.deals.length > 0 && (
            <TouchableOpacity
              style={styles.mealButton}
              onPress={() => setMealModalVisible(true)}
            >
              <Text style={styles.mealButtonText}>🍽️ 献立を提案</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <MealSuggestionModal
        store={store}
        visible={mealModalVisible}
        onClose={() => setMealModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardExpanded: {
    borderRadius: 0,
    shadowOpacity: 0,
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  storeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emojiContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF5F0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  storeText: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#999',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#DDD',
  },
  openStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  dealBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 2,
  },
  dealCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  dealLabel: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#FF6B35',
  },
  closeButton: {
    padding: 4,
  },
  dealScroll: {
    marginHorizontal: -4,
  },
  dealScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  dealItem: {
    width: 200,
    backgroundColor: '#FFF5F0',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  dealTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  dealSummary: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#555',
    lineHeight: 16,
  },
  dealLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  dealLinkText: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#FF6B35',
  },
  noDeal: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  noDealText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#CCC',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF6B35',
  },
  mealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
  },
  mealButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFF',
  },
});
