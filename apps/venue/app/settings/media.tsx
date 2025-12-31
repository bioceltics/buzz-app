import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSettings } from '@/hooks/useSettings';
import { COLORS, SHADOWS } from '@/constants/colors';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';

export default function MediaScreen() {
  const { venue, isLoading, uploadVenueImage, removeGalleryImage } = useSettings();
  const [uploading, setUploading] = useState<'logo' | 'cover' | 'gallery' | null>(null);

  const pickImage = async (type: 'logo' | 'cover' | 'gallery') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload images!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : type === 'cover' ? [16, 9] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(type);
        await uploadVenueImage(result.assets[0].uri, type);
        setUploading(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setUploading(null);
    }
  };

  const galleryImages = (venue as any)?.images || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photos & Media</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo</Text>
          <View style={styles.card}>
            <View style={styles.mediaRow}>
              <View style={styles.logoPreview}>
                {venue?.logo_url ? (
                  <Image source={{ uri: venue.logo_url }} style={styles.logoImage} />
                ) : (
                  <BuzzeeIcon size={40} showBackground />
                )}
              </View>
              <View style={styles.mediaInfo}>
                <Text style={styles.mediaTitle}>Venue Logo</Text>
                <Text style={styles.mediaDescription}>
                  Square image, recommended 512x512px
                </Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickImage('logo')}
                  disabled={uploading === 'logo'}
                >
                  {uploading === 'logo' ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.uploadButtonText}>Upload</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Cover Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Image</Text>
          <View style={styles.card}>
            <View style={styles.coverPreview}>
              {(venue as any)?.cover_image_url ? (
                <Image
                  source={{ uri: (venue as any).cover_image_url }}
                  style={styles.coverImage}
                />
              ) : (
                <LinearGradient
                  colors={['#E5E7EB', '#D1D5DB']}
                  style={styles.coverPlaceholder}
                >
                  <Ionicons name="image-outline" size={48} color={COLORS.textTertiary} />
                  <Text style={styles.coverPlaceholderText}>
                    Recommended: 1200x400px
                  </Text>
                </LinearGradient>
              )}
            </View>
            <TouchableOpacity
              style={styles.coverUploadButton}
              onPress={() => pickImage('cover')}
              disabled={uploading === 'cover'}
            >
              {uploading === 'cover' ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.coverUploadText}>Upload Cover Image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Gallery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <Text style={styles.galleryCount}>{galleryImages.length}/10</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.galleryGrid}>
              {galleryImages.map((imageUrl: string, index: number) => (
                <View key={index} style={styles.galleryItem}>
                  <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeGalleryImage(imageUrl)}
                  >
                    <Ionicons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {galleryImages.length < 10 && (
                <TouchableOpacity
                  style={styles.addGalleryButton}
                  onPress={() => pickImage('gallery')}
                  disabled={uploading === 'gallery'}
                >
                  {uploading === 'gallery' ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Ionicons name="add" size={28} color={COLORS.primary} />
                      <Text style={styles.addGalleryText}>Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {galleryImages.length === 0 && (
              <Text style={styles.emptyGalleryText}>
                Add photos to showcase your venue
              </Text>
            )}
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <LinearGradient
            colors={['#ECFDF5', '#D1FAE5']}
            style={styles.tipsIconBg}
          >
            <Ionicons name="bulb" size={20} color="#059669" />
          </LinearGradient>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Photo Tips</Text>
            <Text style={styles.tipsText}>
              High-quality photos help attract more customers. Show your venue's atmosphere, seating, and signature offerings.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  galleryCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  mediaDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  coverPreview: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 8,
  },
  coverUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  coverUploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGalleryButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGalleryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyGalleryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tipsIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsContent: {
    flex: 1,
    marginLeft: 14,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 19,
  },
  bottomPadding: {
    height: 40,
  },
});
