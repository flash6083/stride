import ExerciseSelectionModal from '@/app/components/ExerciseSelectionModal';
import { getWorkoutDuration } from '@/lib/utils/helper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, StatusBar, Platform, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useStopwatch } from 'react-timer-hook'
import { useWorkoutStore } from 'store/workout-store';

export default function ActiveWorkout() {

    const [showExerciseSelection, setShowExerciseSelection] = useState(false);

    const { workoutExercises, setWorkoutExercises,
        resetWorkout, weightUnit, setWeightUnit } = useWorkoutStore();

    const { seconds, minutes, reset } = useStopwatch({
        autoStart: true
    })

    const router = useRouter();

    const cancelWorkout = () => {
        Alert.alert('Cancel Workout',
            'Are you sure you want to cancel workout?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'End Workout',
                    style: 'destructive',
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

    const addExercise = () => {
        setShowExerciseSelection(true);
    }

    return (
        <View className='flex-1'>
            <StatusBar barStyle='light-content' backgroundColor='#FF5533' />
            {/* Top Safe area */}
            <View className='bg-orange-900'
                style={{
                    paddingTop: Platform.OS === 'ios' ? 70 :
                        StatusBar.currentHeight || 0
                }}
            />
            {/* Header */}
            <View className='bg-orange-900 px-6 py-4'>
                <View className='flex-row items-start justify-between'>
                    <View>
                        <Text className='text-white text-xl 
                                font-semibold'>
                            Active Workout
                        </Text>
                        <Text className='text-gray-300'>
                            {getWorkoutDuration(seconds, minutes)}
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
            {/*Content Area with white bg*/}
            <View className='flex-1 bg-white'>
                {/*Workout Progress*/}
                <View className='px-6 mt-4'>
                    <Text className='text-center text-gray-600 mb-2 font-medium'>
                        {workoutExercises.length} exercises
                    </Text>
                </View>

                {/* If no exercise, show a message*/}
                {workoutExercises.length === 0 && (
                    <View className='rounded-2xl p-8 items-center mx-6'>
                        <Ionicons name='barbell' size={48} color='#9ca3af' />
                        <Text className='text-gray-600 text-lg text-center mt-4
                        font-medium'>No exercises yet</Text>
                        <Text className='text-gray-500 text-center mt-2'>
                            Get started by adding your first exercise</Text>
                    </View>
                )}

                {/* All exercises - vertical list*/}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className='flex-1'>

                    <ScrollView className='flex-1 px-6 mt-4'>
                        {workoutExercises.map((exercise) => (
                            <View key={exercise.id} className='mb-8'>

                            </View>
                        ))}


                        {/* Add exercise button */}
                        <TouchableOpacity
                            onPress={addExercise}
                            className='bg-orange-600 rounded-2xl py-4 items-center 
                        mb-8 active:bg-orange-700'
                            activeOpacity={0.8}>
                            <View className='flex-row items-center'>
                                <Ionicons name='add' size={20} color='white'
                                    style={{ marginRight: 8 }} />
                                <Text className='text-white font-semibold text-lg'>
                                    Add Exercise
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
            <ExerciseSelectionModal
                visible={showExerciseSelection}
                onClose={() => setShowExerciseSelection(false)}>

            </ExerciseSelectionModal>
        </View>
    )
}
