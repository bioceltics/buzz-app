import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';

const MAX_IMAGES = 5;

export default function WriteReviewScreen() {
  const { venue_id } = useLocalSearchParams<{ venue_id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch venue info
  const { data: venue } = useQuery({
    queryKey: ['venue', venue_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, logo_url, type')
        .eq('id', venue_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!venue_id,
  });

  // Check existing review
  const { data: existingReview } = useQuery({
    queryKey: ['user-review', venue_id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('venue_id', venue_id)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user && !!venue_id,
  });

  // Pre-fill if editing
  React.useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
      setImages(existingReview.images || []);
    }
  }, [existingReview]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const session = await supabase.auth.getSession();
      const url = existingReview
        ? `${process.env.EXPO_PUBLIC_API_URL}/api/reviews/${existingReview.id}`
        : `${process.env.EXPO_PUBLIC_API_URL}/api/reviews`;

      const response = await fetch(url, {
        method: existingReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          venue_id,
          rating,
          comment: comment.trim() || undefined,
          images: images.length > 0 ? images : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-reviews', venue_id] });
      queryClient.invalidateQueries({ queryKey: ['venue', venue_id] });
      Alert.alert('Success', existingReview ? 'Review updated!' : 'Review submitted!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `You can only add up to ${MAX_IMAGES} images.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const filename = `review_${Date.now()}.jpg`;
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: filename,
          type: 'image/jpeg',
        } as any);

        const { data, error } = await supabase.storage
          .from('reviews')
          .upload(`${user?.id}/${filename}`, formData);

        if (error) throw error;

        const { data: urlData } = supabase.storage.from('reviews').getPublicUrl(data.path);
        setImages((prev) => [...prev, urlData.publicUrl]);
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Error', 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }

    if (!user) {
      Alert.alert('Login Required', 'Please login to submit a review.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    submitMutation.mutate();
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingReview ? 'Edit Review' : 'Write a Review'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Venue Info */}
        {venue && (
          <View style={styles.venueCard}>
            {venue.logo_url ? (
              <Image source={{ uri: venue.logo_url }} style={styles.venueLogo} />
            ) : (
              <View style={[styles.venueLogo, styles.placeholderLogo]}>
                <Ionicons name="business" size={24} color={Colors.textSecondary} />
              </View>
            )}
            <View>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.venueType}>{venue.type}</Text>
            </View>
          </View>
        )}

        {/* Star Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.sectionTitle}>Your Rating</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={44}
                  color={star <= rating ? Colors.warning : Colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Comment */}
        <View style={styles.commentContainer}>
          <Text style={styles.sectionTitle}>Your Review (Optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience at this venue..."
            placeholderTextColor={Colors.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/1000</Text>
        </View>

        {/* Photos */}
        <View style={styles.photosContainer}>
          <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photosRow}>
              {images.map((uri, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < MAX_IMAGES && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                  {uploading ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
          <Text style={styles.photoHint}>
            {images.length}/{MAX_IMAGES} photos added
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {existingReview ? 'Update Review' : 'Submit Review'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 24,
  },
  venueLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  placeholderLogo: {
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  venueType: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  photosContainer: {
    marginBottom: 24,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  photoHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
