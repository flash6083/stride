import { sanityClient } from "@/lib/sanity/client";
import { WORKOUTS_QUERY } from "@/lib/sanity/queries";
import { Workout } from "@/lib/sanity/types";
import { formatDate, formatDuration, getTotalSets, getWorkoutStats } from "@/lib/utils/helper";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    averageDuration: 0,
    joinDate: new Date(),
    daysSinceJoining: 0
  })

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
      console.log('Error fetching workouts:', error);
      Alert.alert('Error', 'Failed to fetch workouts. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  }

  useEffect(() => {
    if (user?.id) {
      fetchWorkouts();
    }
  }, [user?.id])

  useEffect(() => {
    if (workouts.length === 0) return;

    const stats = getWorkoutStats(workouts);

    const joinDate = user?.createdAt
      ? new Date(user.createdAt)
      : new Date();

    const daysSinceJoining = Math.floor(
      (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    setWorkoutStats({
      ...stats,
      joinDate,
      daysSinceJoining
    });
    setLoading(false);
  }, [workouts]);

  return (
    <>
      {loading ? (
        <SafeAreaView className='flex-1 bg-gray-50'>
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size="large" color="F54927" />
            <Text className='text-gray-600 mt-4'>Loading profile...</Text>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView className="flex-1 bg-gray-50">
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing}
              onRefresh={onRefresh} />}
            className="flex-1">

            {/* Header */}
            <View className="px-6 pt-8 pb-6">
              <Text className="text-lg text-gray-600">Welcome back,</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {user?.firstName || 'Athlete'}! 💪
              </Text>
            </View>

            {/* Stats Overview */}

            <View className="px-6 mb-6">
              <View className="bg-white rounded-2xl p-6 shadow-sm border
                            border-gray-100">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Your Stats
                </Text>
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-2xl font-bold text-orange-600">
                      {workoutStats.totalWorkouts}
                    </Text>
                    <Text className="text-sm text-gray-600 text-center">
                      Total{'\n'}Workouts
                    </Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="font-bold text-2xl text-green-600">
                      {formatDuration(workoutStats.totalDuration)}
                    </Text>
                    <Text className="text-sm text-gray-600 text-center">
                      Total{'\n'}Time
                    </Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-2xl font-bold text-purple-600">
                      {workoutStats.daysSinceJoining}
                    </Text>
                    <Text className="text-sm text-gray-600 text-center">
                      Days{'\n'}Since Joining
                    </Text>
                  </View>
                </View>
                {workoutStats.totalWorkouts > 0 && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600">
                        Average workout duration:
                      </Text>
                      <Text className="font-semibold text-gray-900">
                        {formatDuration(workoutStats.averageDuration)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions */}

            <View className="px-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900
                mb-4">Quick Actions
              </Text>
              {/* Start Workout Button */}
              <TouchableOpacity
                onPress={() => router.push('/active-workout')}
                className="bg-orange-600 rounded-2xl p-6 mb-4 shadow-sm"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-[#FF892E] rounded-full
                      items-center justify-center mr-4">
                      <Ionicons name="play" size={24} color='white' />
                    </View>
                    <View>
                      <Text className="text-white text-xl font-semibold">
                        Start Workout
                      </Text>
                      <Text className="text-orange-100">
                        Begin your training session
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color='white' />
                </View>
              </TouchableOpacity>

              {/* Action grid */}
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => router.push('/history')}
                  className="bg-white rounded-2xl p-4 flex-1  shadow-sm border
                    border-gray-100"
                  activeOpacity={0.7}
                >
                  <View className="items-center">
                    <View className="w-12 h-12 bg-gray-100 rounded-full 
                    items-center justify-center mb-3">
                      <Ionicons name="time-outline" size={24} color="#6B7280" />
                    </View>
                    <Text className="text-gray-900 font-medium text-center">
                      Workout{'\n'}History
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/exercises')}
                  className="bg-white rounded-2xl p-4 flex-1  shadow-sm border
                    border-gray-100"
                  activeOpacity={0.7}
                >
                  <View className="items-center">
                    <View className="w-12 h-12 bg-gray-100 rounded-full 
                    items-center justify-center mb-3">
                      <Ionicons name="barbell-outline" size={24} color="#6B7280" />
                    </View>
                    <Text className="text-gray-900 font-medium text-center">
                      Browse{'\n'}Exercises
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Last workout */}

            {workouts[0] && (
              <View className="px-6 mb-8">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Last Workout
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: '/history/workout-record',
                      params: { workoutId: workouts[0]._id }
                    })
                  }}
                  className="bg-white rounded-2xl p-6 shadow-sm
                    border border-gray-100"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View>
                      <Text className="text-lg font-semibold text-gray-900">
                        {formatDate(workouts[0].date || '')}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={16} color='#6B7280' />
                        <Text className="text-gray-600 ml-2">
                          {workouts[0].duration ? formatDuration(workouts[0].duration)
                            : 'Duration not recorded'}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-orange-100 rounded-full w-12 h-12 
                      items-center justify-center">
                      <Ionicons name="fitness-outline" size={24} color='#FF2A00' />
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600">
                      {workouts[0].exercises?.length || 0} exercises ∙{' '}
                      {getTotalSets(workouts[0])} sets
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color='#6B7280' />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State for no workouts */}

            {workoutStats.totalWorkouts === 0 && (
              <View className="px-6 mb-8">
                <View className="bg-white rounded-2xl p-8 items-center
                shadow-sm border border-gray-100">
                  <View className="w-16 h-16 bg-orange-100 rounded-full 
                    items-center justify-center mb-4">
                    <Ionicons name="barbell-outline" size={32} color='#FF2A00' />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to start your fitness journey?
                  </Text>
                  <Text className="text-gray-600 text-center mb-4">
                    Track your workouts and see your progress over time
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/workout')}
                    className="bg-orange-600 rounded-xl px-6 py-3"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-semibold">
                      Start your first workout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>
        </SafeAreaView>
      )}
    </>

  );
}


