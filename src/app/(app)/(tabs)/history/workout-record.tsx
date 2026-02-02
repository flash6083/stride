import { View, Text, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { sanityClient } from '@/lib/sanity/client'
import { SINGLE_WORKOUT_QUERY } from '@/lib/sanity/queries'
import { Workout } from '@/lib/sanity/types'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { formatDate, formatTime, formatWorkoutDuration, getTotalVolume } from '@/lib/utils/helper'

const WorkoutRecord = () => {
    const { workoutId } = useLocalSearchParams()

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [workout, setWorkout] = useState<Workout | null>();
    const [volumeUnit, setVolumeUnit] = useState<{ volume: number; unit: string }>({ volume: 0, unit: '' });

    const router = useRouter();

    const handleDeleteWorkout = () => {
        Alert.alert("Delete Workout",
            "Are you sure you want to delete this workout? This action cannot be undone.",
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: deleteWorkout
                }
            ]
        )
    }

    const deleteWorkout = async () => {
        if (!workoutId) {
            Alert.alert('Error', 'Workout ID not found');
            return;
        }
        setDeleting(true);
        try {
            await fetch("/api/delete-workout", {
                method: 'POST',
                body: JSON.stringify({ workoutId })
            });
            router.replace("/(app)/(tabs)/history?refresh=true");
        } catch (error) {
            Alert.alert('Error', 'Failed to delete workout. Please try again later.', [
                { text: "OK" }
            ]);
            console.log('Error deleting workout:', error);
        } finally {
            setDeleting(false);
        }
    }

    const fetchWorkout = async () => {
        if (!workoutId) {
            Alert.alert('Error', 'Workout ID not found');
            return;
        }
        try {
            const result = await sanityClient.fetch(SINGLE_WORKOUT_QUERY, {
                workoutId
            })
            setWorkout(result);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch workout. Please try again later.');
            console.log('Error fetching workout:', error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchWorkout();
        if (workout) {
            let { volume, unit } = getTotalVolume(workout);
            setVolumeUnit({ volume, unit });
        }
    }, [workoutId])

    return (
        <>
            {loading ? (
                <SafeAreaView className='flex-1 bg-gray-50'>
                    <View className='flex-1 items-center justify-center'>
                        <ActivityIndicator size="large" color="#F54927" />
                        <Text className='text-gray-600 mt-4'>Loading workout...</Text>
                    </View>
                </SafeAreaView>
            ) : workout ? (
                <View className='flex-1 bg-gray-50'>
                    <ScrollView className='flex-1'>
                        {/*Workout Summary*/}
                        <View className='bg-white p-6 border-b border-gray-300'>
                            <View className='flex-row items-center justify-between mb-4'>
                                <Text className='text-lg font-semibold text-gray-900'>
                                    Workout Summary
                                </Text>
                                <TouchableOpacity
                                    onPress={handleDeleteWorkout}
                                    disabled={deleting}
                                    className='bg-red-600 px-4 py-2 
                                        rounded-lg flex-row items-center'>
                                    {deleting ? (
                                        <ActivityIndicator size="small"
                                            color="#F54927" />) :
                                        (
                                            <>
                                                <Ionicons name="trash-outline"
                                                    size={16} color="#FFFFFF" />
                                                <Text className='
                                                text-white font-medium ml-2'>
                                                    Delete
                                                </Text>
                                            </>
                                        )}
                                </TouchableOpacity>
                            </View>
                            <View className='flex-row items-center mb-3'>
                                <Ionicons name='calendar-outline' size={20} color="#F54927" />
                                <Text className='text-gray-700 ml-3 font-medium'>
                                    {formatDate(workout.date)} at {formatTime(workout.date)}
                                </Text>
                            </View>
                            <View className='flex-row items-center mb-3'>
                                <Ionicons name='time-outline' size={20} color='#F54927' />
                                <Text className='text-gray-700 ml-3 font-medium'>
                                    {formatWorkoutDuration(workout.duration)}
                                </Text>
                            </View>
                            <View className='flex-row items-center mb-3'>
                                <Ionicons name='fitness-outline' size={20} color='#F54927' />
                                <Text className='text-gray-700 ml-3 font-medium'>
                                    {workout.exercises?.length || 0} exercises
                                </Text>
                            </View>
                            {volumeUnit.volume > 0 && (
                                <View className='flex-row items-center'>
                                    <Ionicons name='barbell-outline' size={20} color='#F54927' />
                                    <Text className='text-gray-700 ml-3 font-medium'>
                                        {volumeUnit.volume.toLocaleString()} {volumeUnit.unit} total volume
                                    </Text>
                                </View>
                            )}
                        </View>
                        {/* Exercise List*/}
                        <View className='space-y-4 p-6 gap-4'>
                            {workout.exercises?.map((exerciseData, index) => (
                                <View
                                    key={exerciseData._key}
                                    className='bg-white rounded-2xl p-6 shadow-sm
                                    border border-gray-100'
                                >
                                    {/* Exercise Header*/}
                                    <View className='flex-row items-center justify-center
                                    mb-4'>
                                        <View className='flex-1'>
                                            <Text className='text-lg font-bold text-gray-900'>
                                                {exerciseData.exercise?.name || 'Unknown Exercise'}
                                            </Text>
                                            <Text className='text-gray-900 text-sm mt-1'>
                                                {exerciseData.sets?.length || 0} sets completed
                                            </Text>
                                        </View>
                                        <View className='bg-orange-100 rounded-full w-10 h-10 
                                                items-center justify-center'>
                                            <Text className='text-orange-600 font-bold'>{index + 1}</Text>
                                        </View>
                                    </View>
                                    {/* Sets List */}
                                    <View className='space-y-2'>
                                        <Text className='text-sm font-medium text-gray-700 mb-2'>
                                            Sets:
                                        </Text>
                                        {exerciseData.sets?.map((set, setIndex) => (
                                            <View key={set._key}
                                                className='bg-gray-50 rounded-lg p-3 flex-row items-center
                                            justify-between mb-1'>
                                                <View className='flex-row items-center'>
                                                    <View className='bg-gray-200 rounded-full w-6 h-6 items-center
                                                    justify-center mr-3'>
                                                        <Text className='text-gray-700 text-xs font-medium'>
                                                            {setIndex + 1}
                                                        </Text>
                                                    </View>
                                                    <Text className='text-gray-900 font-medium'>
                                                        {set.reps} reps
                                                    </Text>
                                                </View>
                                                {set.weight && (
                                                    <View className='flex-row items-center'>
                                                        <Ionicons
                                                            name="barbell-outline" size={16} color='#6B7280' />
                                                        <Text className='text-gray-700 ml-2 font-medium'>
                                                            {set.weight} {set.weightUnit || 'kg'}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                    {/* Exercise Volume Summary */}
                                    {exerciseData.sets && exerciseData.sets.length > 0 && (
                                        <View className='mt-4 pt-4 border-t border-gray-100'>
                                            <View className='flex-row items-center justify-between'>
                                                <Text className='text-sm text-gray-600'>
                                                    Exercise Volume
                                                </Text>
                                                <Text className='text-sm font-medium text-gray-900'>
                                                    {exerciseData.sets.reduce((total, set) => {
                                                        return total + (set.weight || 0) * (set.reps || 0);
                                                    }, 0).toLocaleString()}{" "}
                                                    {exerciseData.sets[0]?.weightUnit || 'kg'}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <SafeAreaView className='flex-1 bg-gray-50'>
                    <View className='flex-1 items-center justify-center'>
                        <Ionicons name="alert-circle-outline" size={64} color="EF4444" />
                        <Text className='text-xl font-semibold text-gray-900 mt-4'>
                            Workout not found
                        </Text>
                        <Text className='text-gray-600 text-center mt-2'>
                            The requested workout was not found.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className='bg-orange-600 px-6 py-3 rounded-lg mt-6'>
                            <Text className='text-white font-medium'>Go back</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}
        </>
    );

}

export default WorkoutRecord