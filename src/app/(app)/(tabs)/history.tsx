import { View, Text, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import React, { use, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { sanityClient } from '@/lib/sanity/client'
import { WORKOUTS_QUERY } from '@/lib/sanity/queries'
import { useUser } from '@clerk/clerk-expo'
import { Workout } from '@/lib/sanity/types'
import { useLocalSearchParams, useRouter } from 'expo-router'

const History = () => {
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refresh } = useLocalSearchParams();
  const router = useRouter();

  const fetchWorkouts = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }
    try {
      const results = await sanityClient.fetch(WORKOUTS_QUERY, {
        userId: user.id
      })
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch workouts. Please try again later.');
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  // Handle refresh parameter from deleted workout
  useEffect(() => {
    if (refresh === 'true') {
      fetchWorkouts();
      // Clear refresh parameter from URL
      router.replace("/(app)/(tabs)/history");
    }
  }, [refresh]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  }

  return (
    <>
      {loading ? (

        <SafeAreaView className='flex-1 bg-gray-50'>
          <View className='px-6 py-4 bg-white border-b border-gray-200'>
            <Text className='text-2xl font-bold text-gray-900'>Workout History</Text>
          </View>
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size="large" color="F54927" />
            <Text className='text-gray-600 mt-4'>Loading your workouts...</Text>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView className='flex-1 bg-gray-50'>
          {/*Header*/}
          <View className='px-6 py-4 bg-white border-b border-gray-200'>
            <Text className='text-2xl font-bold text-gray-900'>
              Workout History
            </Text>
            <Text className='text-gray-600 mt-1'>
              {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
            </Text>
          </View>

          {/* Workouts List */}
          <ScrollView
            className='flex-1'
            contentContainerStyle={{ padding: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >

          </ScrollView>
        </SafeAreaView>
      )}
    </>
  )
}

export default History