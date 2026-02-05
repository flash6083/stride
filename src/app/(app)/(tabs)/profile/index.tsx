import React, { useEffect, useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useClerk, useUser } from '@clerk/clerk-expo'
import { Workout } from "@/lib/sanity/types";
import { sanityClient } from "@/lib/sanity/client";
import { WORKOUTS_QUERY } from "@/lib/sanity/queries";
import { formatDuration, formatJoinDate, getWorkoutStats } from "@/lib/utils/helper";


export default function ProfilePage() {

  const { signOut } = useClerk();
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
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
    }
  }

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => await signOut()
      }
    ]);
  }

  useEffect(() => {
    if (!user?.id) return;
    fetchWorkouts();
  }, [user?.id]);


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
        <SafeAreaView className="flex flex-1">
          <ScrollView className="flex-1">
            {/* Header */}

            <View className="px-6 pt-8 pb-6">
              <Text className="text-3xl font-bold text-gray-900">Profile</Text>
              <Text className="text-lg text-gray-600 mt-1">
                Manage your accounts and stats
              </Text>
            </View>

            {/* User Info Card */}

            <View className="px-6 mb-6">
              <View className="bg-white rounded-2xl p-6 shadow-sm 
                border border-gray-100">
                <View className="flex-row items-center mb-4">
                  <View className="w-16 h-16 bg-orange-600 rounded-full 
                    items-center justify-center mr-4">
                    <Image
                      source={{
                        uri: user.externalAccounts[0]?.imageUrl ??
                          user?.imageUrl
                      }}
                      className="rounded-full"
                      style={{ width: 64, height: 64 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-gray-900">
                      {user?.firstName && user?.lastName ?
                        `${user.firstName} ${user.lastName}` : user?.firstName
                        || 'User'}
                    </Text>
                    <Text className="text-gray-600">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      Member since {formatJoinDate(workoutStats.joinDate)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stats Overview */}

            <View className="px-6 mb-6">
              <View className="bg-white rounded-2xl p-6 shadow-sm border
                border-gray-100">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Your Fitness Stats
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

            {/* Account Settings */}
            <View className="px-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Account Settings
              </Text>

              {/* Settings option */}
              <View className="bg-white rounded-2xl shadow-sm border 
                border-gray-100">
                <TouchableOpacity className="flex-row items-center justify-between
                    p-4 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-orange-100 rounded-full
                          items-center justify-center mr-3">
                      <Ionicons name='person-outline' size={20} color='#FF2A00' />
                    </View>
                    <Text className="text-gray-900 font-medium">Edit Profile</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color='#6B7280' />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between
                    p-4 border border-gray-100">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-100 rounded-full
                    items-center justify-center mr-3">
                      <Ionicons name='notifications-outline' size={20} color='#10B981' />
                    </View>
                    <Text className="text-gray-900 font-medium">Notifications</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color='#6B7280' />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between
                    p-4 border border-gray-100">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-purple-100 rounded-full
                    items-center justify-center mr-3">
                      <Ionicons name='settings-outline' size={20} color='#8B5CF6' />
                    </View>
                    <Text className="text-gray-900 font-medium">Preferences</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color='#6B7280' />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between
                    p-4 border border-gray-100">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-100 rounded-full
                    items-center justify-center mr-3">
                      <Ionicons name='help-circle-outline' size={20} color='#5C5CFF' />
                    </View>
                    <Text className="text-gray-900 font-medium">Help & Support</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color='#6B7280' />
                </TouchableOpacity>

              </View>
            </View>

            {/*Sign out*/}
            <View className="px-6 mb-8">
              <TouchableOpacity
                onPress={handleSignOut}
                className="bg-red-600 rounded-2xl p-4 shadow-sm"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="log-out-outline" size={24} color="white" className="mr-2" />
                  <Text className="text-white font-semibold text-lg">
                    Sign Out
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </>

  );
}