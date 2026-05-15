import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../types';

interface StoreCardProps {
  store: Store;
  onClose?: () => void;
  expanded?: boolean;
}

export default function StoreCard({ store, onClose, expanded = false }: StoreCardProps) {
  const distanceText =
    store.distance < 1000
      ? `${Math.round(store.distance)}m`
      : `${(store.distance / 1000).toFixed(1)}km`;

  const openFlyer = (url: string) => {
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

        {/* Flyer Count Badge */}
        <View style={styles.flyerBadge}>
          <Text style={styles.flyerCount}>{store.flyerCount}</Text>
          <Text style={styles.flyerLabel}>チラシ</Text>
        </View>

        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Flyers */}
      {store.flyers.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.flyerScroll}
          contentContainerStyle={styles.flyerScrollContent}
        >
          {store.flyers.map((flyer) => (
            <TouchableOpacity
              key={flyer.id}
              style={styles.flyerItem}
              onPress={() => openFlyer(flyer.pageUrl)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: flyer.thumbUrl }}
                style={styles.flyerThumb}
                resizeMode="cover"
              />
              {flyer.validUntil && (
                <View style={styles.validBadge}>
                  <Text style={styles.validText} numberOfLines={1}>
                    {flyer.validUntil}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noFlyer}>
          <Text style={styles.noFlyerText}>チラシなし</Text>
        </View>
      )}

      {!expanded && (
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => openFlyer(
            store.flyers[0]?.pageUrl ??
            `https://www.shufoo.net/pntweb/shopSearchList/?keyword=${encodeURIComponent(store.name)}`
          )}
        >
          <Text style={styles.viewMoreText}>Shufooで見る</Text>
          <Ionicons name="open-outline" size={14} color="#FF6B35" />
        </TouchableOpacity>
      )}
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
    fontFamily: 'NotoSansJP-Bold',
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
    fontFamily: 'NotoSansJP-Regular',
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
    fontFamily: 'NotoSansJP-Medium',
  },
  flyerBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 2,
  },
  flyerCount: {
    fontSize: 20,
    fontFamily: 'NotoSansJP-Bold',
    color: '#FF6B35',
  },
  flyerLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansJP-Regular',
    color: '#FF6B35',
  },
  closeButton: {
    padding: 4,
  },
  flyerScroll: {
    marginHorizontal: -4,
  },
  flyerScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  flyerItem: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  flyerThumb: {
    width: 120,
    height: 90,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  validBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  validText: {
    fontSize: 9,
    color: '#FFF',
    textAlign: 'center',
  },
  noFlyer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  noFlyerText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    color: '#CCC',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 4,
  },
  viewMoreText: {
    fontSize: 13,
    fontFamily: 'NotoSansJP-Medium',
    color: '#FF6B35',
  },
});
