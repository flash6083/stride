import { getWorkoutDuration } from '@/lib/utils/helper';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View, Text, StatusBar, Platform, TouchableOpacity, Alert } from 'react-native';
import { useStopwatch } from 'react-timer-hook'
import { useWorkoutStore } from 'store/workout-store';

export default function ActiveWorkout() {

    const router = useRouter();

    const { workoutExercises, setWorkoutExercises,
        resetWorkout, weightUnit, setWeightUnit } = useWorkoutStore();

    const { seconds, minutes } = useStopwatch({
        autoStart: true
    })

    const cancelWorkout = () => {
        Alert.alert('Cancel Workout',
            'Are you sure you want to cancel workout?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'End Workout',
                    onPress: () => {
                        resetWorkout();
                        router.back();
                    }
                }
            ]
        )
    }

    // Reset Timer when screen is focused and no active workout (fresh start)

    useFocusEffect(useCallback(() => {
        if (workoutExercises.length === 0) {
            reset();
        }
    }, [workoutExercises.length, reset]))

    return (
        <View className='flex-1'>
            <StatusBar barStyle='light-content' backgroundColor='#FF5533' />
            {/* Top Safe area */}
            <View className='bg-orange-900'
                style={{ paddingTop: Platform.OS === 'ios' ? 70 : StatusBar.currentHeight || 0 }}>
                {/* Header */}
                <View className='bg-gray-600 px-6 py-4'>
                    <View className='flex-row items-center justify-between'>
                        <View>
                            <Text className='text-white text-xl 
                                font-semibold'>
                                Active Workout
                            </Text>
                            <Text className='text-gray-300'>
                                {getWorkoutDuration(minutes, seconds)}
                            </Text>
                        </View>
                        <View className='flex-row items-center space-x-3 gap-2'>
                            {/* Weight Unit Toggle */}
                            <View className='flex-row bg-gray-700 rounded-lg p-1'>
                                <TouchableOpacity
                                    onPress={() => setWeightUnit('kg')}
                                    className={`px-3 py-1 rounded 
                                        ${weightUnit === 'kg' ? 'bg-orange-600' : ''}`}>
                                    <Text className={
                                        `text-sm font-medium ${weightUnit === 'kg' ?
                                            'text-white' : 'text-gray-300'
                                        }`
                                    }>
                                        kg
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setWeightUnit('lbs')}
                                    className={`px-3 py-1 rounded 
                                        ${weightUnit === 'lbs' ? 'bg-orange-600' : ''}`}>
                                    <Text className={
                                        `text-sm font-medium ${weightUnit === 'lbs' ?
                                            'text-white' : 'text-gray-300'
                                        }`
                                    }>
                                        lbs
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={cancelWorkout}
                                className='bg-red-600 px-4 py-2 
                            rounded-lg'>
                                <Text className='text-white font-medium'>End Workout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}
