import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '../../hooks/useStores';
import StoreCard from '../../components/StoreCard';
import { Store } from '../../types';

type ViewMode = 'map' | 'list';

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const { stores, location, loading, error, refresh } = useStores();

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="location-off" size={48} color="#FF6B35" />
        <Text style={styles.errorTitle}>位置情報を取得できません</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
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
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons
              name="map"
              size={18}
              color={viewMode === 'map' ? '#FAFAF7' : '#2D2D2D'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={18}
              color={viewMode === 'list' ? '#FAFAF7' : '#2D2D2D'}
            />
          </TouchableOpacity>
        </View>
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
            {stores.reduce((acc, s) => acc + s.flyerCount, 0)}
          </Text>
          <Text style={styles.statLabel}>お得情報</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500m</Text>
          <Text style={styles.statLabel}>範囲</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>周辺店舗を検索中...</Text>
        </View>
      ) : viewMode === 'map' ? (
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
                radius={500}
                fillColor="rgba(255, 107, 53, 0.08)"
                strokeColor="rgba(255, 107, 53, 0.3)"
                strokeWidth={1}
              />
              {stores.map((store) => (
                <Marker
                  key={store.id}
                  coordinate={{
                    latitude: store.latitude,
                    longitude: store.longitude,
                  }}
                  onPress={() => setSelectedStore(store)}
                >
                  <View style={[
                    styles.markerContainer,
                    selectedStore?.id === store.id && styles.markerSelected
                  ]}>
                    <Text style={styles.markerEmoji}>{store.categoryEmoji}</Text>
                    {store.flyerCount > 0 && (
                      <View style={styles.markerBadge}>
                        <Text style={styles.markerBadgeText}>{store.flyerCount}</Text>
                      </View>
                    )}
                  </View>
                </Marker>
              ))}
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
            </View>
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
    fontFamily: 'NotoSansJP-Regular',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'NotoSansJP-Bold',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    padding: 8,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#2D2D2D',
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
    fontFamily: 'NotoSansJP-Bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansJP-Regular',
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
  markerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  markerSelected: {
    backgroundColor: '#FF6B35',
    transform: [{ scale: 1.15 }],
  },
  markerEmoji: {
    fontSize: 22,
  },
  markerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  markerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'NotoSansJP-Bold',
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
  loadingText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#999',
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-Bold',
    color: '#1A1A1A',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'NotoSansJP-Regular',
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
    fontFamily: 'NotoSansJP-Bold',
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
    fontFamily: 'NotoSansJP-Regular',
    color: '#999',
    textAlign: 'center',
  },
});
