import { View, Text, Alert, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { sanityClient } from '@/lib/sanity/client'
import { WORKOUTS_QUERY } from '@/lib/sanity/queries'
import { useUser } from '@clerk/clerk-expo'
import { Workout } from '@/lib/sanity/types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { formatDate, formatWorkoutDuration } from '@/lib/utils/helper'

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
      setWorkouts(results);
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

  const getTotalSets = (workout: Workout) => {
    return (
      workout.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets?.length || 0);
      }, 0) || 0
    )
  }

  const getExerciseNames = (workout: Workout) => {
    return (
      workout.exercises?.map((ex) => ex.exercise?.name).filter(Boolean) || []
    )
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
            {workouts.length === 0 ? (
              <View className='bg-white rounded-2xl p-8 items-center '>
                <Ionicons name="barbell-outline" size={64} color="#F54927" />
                <Text className='text-xl font-semiboldtext-gray-600 mt-4'>
                  No workouts found
                </Text>
                <Text className='text-gray-600 text-center mt-2'>
                  Your completed workouts will appear here
                </Text>
              </View>
            ) : (
              <View className='space-y-4 gap-4'>
                {
                  workouts.map((workout) => (
                    <TouchableOpacity
                      key={workout._id}
                      className='bg-white rounded-2xl p-6 shadow-sm
                      border border-gray-100'
                      activeOpacity={0.7}
                      onPress={() => {
                        router.push({
                          pathname: "/history/workout-record",
                          params: {
                            workoutId: workout._id
                          }
                        })
                      }}>
                      {/* Workout header */}
                      <View className='flex-row items-center justify-between mb-4'>
                        <View className='flex-1'>
                          <Text className='text-lg font-semibold text-gray-900'>
                            {formatDate(workout.date || '')}
                          </Text>
                          <View className='flex-row items-center mt-1'>
                            <Ionicons name="time-outline" size={16} color="#F54927" />
                            <Text className='text-gray-600 ml-2'>
                              {formatWorkoutDuration(workout.duration)}
                            </Text>
                          </View>
                        </View>
                        <View className='bg-orange-100 rounded-full w-12 h-12
                          items-center justify-center'>
                          <Ionicons name="fitness-outline" size={24} color="#F54927" />
                        </View>
                      </View>
                      {/* Workout stats */}
                      <View className='flex-row justify-between items-center mb-4'>
                        <View className='flex-row items-center'>
                          <View className='bg-gray-100 rounded-lg px-3 py-2 mr-3'>
                            <Text className='text-sm font-medium text-gray-700'>
                              {workout.exercises?.length || 0} exercises
                            </Text>
                          </View>
                          <View className='bg-gray-100 rounded-lg px-3 py-2 mr-3'>
                            <Text className='text-sm font-medium text-gray-700'>
                              {getTotalSets(workout)} sets
                            </Text>
                          </View>
                        </View>
                      </View>
                      {/*Workout List */}
                      {workout.exercises && workout.exercises.length > 0 && (
                        <View>
                          <Text className='text-sm font-medium text-gray-700 mb-2'>
                            Exercises:
                          </Text>
                          <View className='flex-row flex-wrap'>
                            {getExerciseNames(workout).slice(0, 3).map((name, index) => (
                              <View className='bg-orange-50 rounded-lg px-3 py-1
                              mr-2 mb-2'
                                key={index}>
                                <Text className='text-orange-700 text-sm font-medium'>
                                  {name}
                                </Text>
                              </View>
                            ))}
                            {getExerciseNames(workout).length > 3 && (
                              <View className='bg-gray-100 rounded-lg px-3 py-1
                              mr-2 mb-2'>
                                <Text className='text-gray-600 text-sm font-medium'>
                                  +{getExerciseNames(workout).length - 3} more
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                }
              </View>
            )
            }
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  )
}

export default History