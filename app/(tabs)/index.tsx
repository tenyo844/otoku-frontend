import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '../../hooks/useStores';
import StoreCard from '../../components/StoreCard';
import MealSuggestionModal from '../../components/MealSuggestionModal';
import ChirashiImageModal from '../../components/ChirashiImageModal';
import { Store } from '../../types';

const NEARBY_RADIUS = Number(process.env.EXPO_PUBLIC_NEARBY_STORES_RADIUS_METERS ?? 5000);

const CATEGORY_COLOR: Record<string, string> = {
  supermarket: '#4DB547',
  grocery_store: '#4DB547',
  convenience_store: '#FF9800',
  drugstore: '#29B6F6',
  pharmacy: '#29B6F6',
  department_store: '#AB47BC',
  clothing_store: '#AB47BC',
  shoe_store: '#AB47BC',
  restaurant: '#F44336',
  cafe: '#795548',
  bakery: '#795548',
  electronics_store: '#78909C',
  home_goods_store: '#607D8B',
  furniture_store: '#607D8B',
  hardware_store: '#607D8B',
  book_store: '#FF7043',
  pet_store: '#FF7043',
  liquor_store: '#FF7043',
  florist: '#EC407A',
  jewelry_store: '#EC407A',
};

type ViewMode = 'map' | 'list';

function StoreLoadingScreen() {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, []);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingEmoji}>🗺️</Text>
      <Text style={styles.loadingTitle}>周辺のお買い得を探しています</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressFill, { width: widthInterpolate as any }]} />
      </View>
      <Text style={styles.loadingHint}>5km圏内の店舗を確認中…</Text>
      <Text style={styles.loadingSubhint}>GPS・チラシ情報を取得しています</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [mealStore, setMealStore] = useState<Store | null>(null);
  const [chirashiModalVisible, setChirashiModalVisible] = useState(false);
  const { stores, location, loading, error, refresh } = useStores();

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="location-outline" size={48} color="#FF6B35" />
        <Text style={styles.errorTitle}>位置情報を取得できません</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAF7" />
        <StoreLoadingScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF7" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>現在地周辺</Text>
          <Text style={styles.headerTitle}>お買い得情報</Text>
        </View>
        {viewMode === 'map' ? (
          <TouchableOpacity style={styles.listBtn} onPress={() => setViewMode('list')}>
            <Ionicons name="menu" size={16} color="#FFF" />
            <Text style={styles.listBtnLabel}>リスト</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.mapBtn} onPress={() => setViewMode('map')}>
            <Ionicons name="map" size={16} color="#FFF" />
            <Text style={styles.listBtnLabel}>地図</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stores.length}</Text>
          <Text style={styles.statLabel}>店舗</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {stores.reduce((acc, s) => acc + s.dealCount, 0)}
          </Text>
          <Text style={styles.statLabel}>お得情報</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{NEARBY_RADIUS >= 1000 ? `${NEARBY_RADIUS / 1000}km` : `${NEARBY_RADIUS}m`}</Text>
          <Text style={styles.statLabel}>範囲</Text>
        </View>
      </View>

      {/* Content */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          {location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
              showsMyLocationButton
            >
              <Circle
                center={location}
                radius={NEARBY_RADIUS}
                fillColor="rgba(255, 107, 53, 0.08)"
                strokeColor="rgba(255, 107, 53, 0.3)"
                strokeWidth={1}
              />
              {stores.map((store) => {
                const color = CATEGORY_COLOR[store.category] ?? '#F44336';
                const isSelected = selectedStore?.id === store.id;
                return (
                  <Marker
                    key={store.id}
                    coordinate={{ latitude: store.latitude, longitude: store.longitude }}
                    onPress={() => setSelectedStore(store)}
                    tracksViewChanges={false}
                  >
                    <View style={styles.pinWrapper}>
                      <View style={[
                        styles.pinHead,
                        { backgroundColor: color },
                        isSelected && styles.pinHeadSelected,
                      ]}>
                        <Text style={styles.pinEmoji}>{store.categoryEmoji}</Text>
                        {store.dealCount > 0 && (
                          <View style={[styles.markerBadge, { backgroundColor: isSelected ? '#FFF' : '#FF3B30' }]}>
                            <Text style={[styles.markerBadgeText, { color: isSelected ? color : '#FFF' }]}>
                              {store.dealCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={[styles.pinTail, { borderTopColor: color }]} />
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          )}

          {/* Bottom Sheet - Selected Store */}
          {selectedStore && (
            <View style={styles.bottomSheet}>
              <StoreCard
                store={selectedStore}
                onClose={() => setSelectedStore(null)}
                expanded
              />
              {selectedStore.deals.length > 0 && (
                <TouchableOpacity
                  style={styles.mapMealButton}
                  onPress={() => setMealStore(selectedStore)}
                >
                  <Text style={styles.mapMealButtonText}>🍽️ 献立を提案する</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {mealStore && (
            <MealSuggestionModal
              store={mealStore}
              visible={!!mealStore}
              onClose={() => setMealStore(null)}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#FF6B35"
            />
          }
          renderItem={({ item }) => (
            <StoreCard store={item} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>周辺にお買い得情報が見つかりませんでした</Text>
            </View>
          }
        />
      )}

      {/* チラシ画像から献立提案 FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setChirashiModalVisible(true)}
      >
        <Ionicons name="newspaper-outline" size={22} color="#FFF" />
        <Text style={styles.fabText}>チラシ</Text>
      </TouchableOpacity>

      <ChirashiImageModal
        visible={chirashiModalVisible}
        onClose={() => setChirashiModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 12,
    backgroundColor: '#FAFAF7',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  listBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  listBtnLabel: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#999',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EBEBEB',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  pinWrapper: {
    alignItems: 'center',
  },
  pinHead: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pinHeadSelected: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pinEmoji: {
    fontSize: 18,
  },
  markerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  markerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  mapMealButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  mapMealButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  loadingEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: 'bold' as const,
    color: '#333',
    textAlign: 'center' as const,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 99,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 99,
  },
  loadingHint: {
    fontSize: 13,
    color: '#888',
  },
  loadingSubhint: {
    fontSize: 11,
    color: '#BBB',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  errorText: {
    fontSize: 13,
    fontWeight: 'normal',
    color: '#999',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
