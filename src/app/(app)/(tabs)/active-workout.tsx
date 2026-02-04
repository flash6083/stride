import { WorkoutData } from '@/app/api/save-workout+api';
import ExerciseSelectionModal from '@/app/components/ExerciseSelectionModal';
import { sanityClient } from '@/lib/sanity/client';
import { EXERCISE_BY_NAME_QUERY } from '@/lib/sanity/queries';
import { getWorkoutDuration } from '@/lib/utils/helper';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, StatusBar, Platform, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useStopwatch } from 'react-timer-hook'
import { useWorkoutStore, WorkoutSet } from 'store/workout-store';

export default function ActiveWorkout() {
    const { user } = useUser();
    const [showExerciseSelection, setShowExerciseSelection] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { workoutExercises, setWorkoutExercises,
        resetWorkout, weightUnit, setWeightUnit } = useWorkoutStore();

    const { seconds, minutes, reset, totalSeconds } = useStopwatch({
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

    const endWorkout = async () => {
        const saved = await saveWorkoutToDatabase();
        console.log('Saved is ', saved);
        if (saved) {
            Alert.alert('Workout Saved', 'Your workout has been saved successfully!')
            // Reset workout
            resetWorkout();
            router.replace('/(app)/(tabs)/history?refresh=true');
        }
    }

    const saveWorkoutToDatabase = async () => {
        // Check if already saving to prevent multiple save attempts
        if (isSaving) {
            Alert.alert('Error', 'Workout is already being saved.');
            return false;
        }
        setIsSaving(true);
        try {
            const durationInSeconds = totalSeconds;
            // Transform exercise data to match Sanity schema
            const exercisesForSanity = await Promise.all(
                workoutExercises.map(async (exercise) => {
                    // Find exercise document in Sanity by name
                    const exerciseDoc = await sanityClient.fetch(EXERCISE_BY_NAME_QUERY, {
                        name: exercise.name,
                    });
                    if (!exerciseDoc) {
                        throw new Error(
                            `Exercise ${exercise.name} not found in database`);
                    }

                    // Transform sets to match schema (only completed sets, convert to
                    // numbers)
                    const setsForSanity = exercise.sets.filter(
                        (set) => set.isCompleted && set.reps && set.weight)
                        .map((set) => ({
                            _type: "set",
                            _key: Math.random().toString(36).slice(2, 11),
                            reps: parseInt(set.reps, 10) || 0,
                            weight: parseFloat(set.weight) || 0,
                            weightUnit: set.weightUnit,
                        }));
                    return {
                        _type: 'workoutExercise',
                        _key: Math.random().toString(36).slice(2, 11),
                        exercise: {
                            _type: "reference",
                            _ref: exerciseDoc._id
                        },
                        sets: setsForSanity
                    }
                })
            );
            // Filter out empty exercises ( no sets )
            const validExercises = exercisesForSanity.filter(
                (exercise) => exercise.sets.length > 0
            );
            if (validExercises.length === 0) {
                Alert.alert('No valid exercises found',
                    'Please add at least one exercise with completed sets to save the workout.');
                return false;
            }

            // Create the workout document
            const workoutData: WorkoutData = {
                _type: "workout",
                userId: user.id,
                date: new Date().toISOString(),
                duration: durationInSeconds,
                exercises: validExercises
            }

            // Save to Sanity via api

            const result = await fetch("/api/save-workout", {
                method: "POST",
                body: JSON.stringify({ workoutData })
            })

            console.log('Workout saved successfully');

            if (result.ok) {
                return true;
            }

        } catch (error) {
            console.log('Error saving workout:', error);
            Alert.alert('Save failed', 'Failed to save workout. Please try again later.');
            return false;
        } finally {
            setIsSaving(false);
        }
    }

    const saveWorkout = () => {
        Alert.alert('Complete Workout',
            'Are you sure that you want to complete the workout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Complete', onPress: async () => await endWorkout() }
            ])
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

    const deleteExercise = (id: string) => {
        setWorkoutExercises((exercises) =>
            exercises.filter((exercise) => exercise.id !== id))
    }

    const addNewSet = (exerciseId: string) => {
        const newSet: WorkoutSet = {
            id: Math.random().toString(),
            reps: "",
            weight: "",
            weightUnit: weightUnit,
            isCompleted: false
        }

        setWorkoutExercises((exercises) => exercises.map((exercise) =>
            exercise.id === exerciseId ?
                { ...exercise, sets: [...exercise.sets, newSet] } : exercise))
    }

    const updateSet = (exerciseId: string, setId: string,
        field: 'reps' | 'weight', value: string) => {
        setWorkoutExercises((exercises) => exercises.map((exercise) =>
            exercise.id === exerciseId
                ? {
                    ...exercise,
                    sets: exercise.sets.map((set) => set.id === setId
                        ? { ...set, [field]: value } : set)
                } : exercise))
    }

    const deleteSet = (exerciseId: string, setId: string) => {
        setWorkoutExercises((exercises) => exercises.map((exercise) =>
            exercise.id === exerciseId
                ? {
                    ...exercise,
                    sets: exercise.sets.filter((set) => set.id !== setId)
                } : exercise))
    }

    const toggleSetCompletion = (exerciseId: string, setId: string) => {
        setWorkoutExercises((exercises) =>
            exercises.map((exercise) =>
                exercise.id === exerciseId ? {
                    ...exercise,
                    sets: exercise.sets.map((set) => set.id === setId
                        ? { ...set, isCompleted: !set.isCompleted } : set)
                } : exercise
            )
        )

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
                                {/* Exercise Header */}
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/exercise-detail',
                                        params: { id: exercise.sanityId }
                                    })}
                                    className='bg-orange-50 
                                    p-4 mb-3rounded-2xl'
                                >
                                    <View className='flex-row items-center justify-between'>
                                        <View className='flex-1'>
                                            <Text className='text-xl font-bold text-gray-900 mb-2'>
                                                {exercise.name}
                                            </Text>
                                            <Text className='text-gray-600'>
                                                {exercise.sets.length} sets •{" "}
                                                {exercise.sets.filter((set) => set.isCompleted).length}
                                                {" "}
                                                completed
                                            </Text>
                                        </View>
                                        { /* Delete exercise button */}
                                        <TouchableOpacity
                                            onPress={() => deleteExercise(exercise.id)}
                                            className='w-10 h-10 rounded-xl items-center
                                            justify-center bg-red-500 ml-3'
                                        >
                                            <Ionicons name='trash' size={16} color='white' />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>

                                {/* Exercise Sets */}
                                <View className='bg-white rounded-2xl p-4 
                                shadow-sm border border-gray-100 mb-3'>
                                    <Text className='text-lg font-semibold text-gray-900
                                    mb-3'>
                                        Sets
                                    </Text>
                                    {exercise.sets.length === 0 ? (
                                        <Text className='text-gray-500 text-center py-4'>
                                            No sets yet. Add your first set below.
                                        </Text>
                                    ) : (exercise.sets.map((set, setIndex) => (
                                        <View
                                            key={set.id}
                                            className={`py-3 px-3 mb-2 rounded-lg
                                                border ${set.isCompleted ? "bg-green-100 border-green-300" :
                                                    "bg-gray-50 border-gray-200"
                                                }`}
                                        >
                                            {/* First Row: Set Number, Reps, Weight, Complete button, 
                                                Delete Button */}
                                            <View className='flex-row items-center justify-between'>
                                                <Text className='text-gray-700 font-medium w-8'>
                                                    {setIndex + 1}
                                                </Text>

                                                {/* Reps Input */}
                                                <View className='flex-1 mx-2'>
                                                    <Text className='text-xs text-gray-500 mb-1'>
                                                        Reps
                                                    </Text>
                                                    <TextInput
                                                        value={set.reps}
                                                        onChangeText={(value) => updateSet(
                                                            exercise.id, set.id, 'reps', value
                                                        )}
                                                        placeholder='0'
                                                        keyboardType='numeric'
                                                        className={`border rounded-lg px-3 py-2
                                                            text-center ${set.isCompleted
                                                                ? 'bg-gray-100 border-gray-300 text-gray-500'
                                                                : 'bg-white border-gray-300'
                                                            }`}
                                                        editable={!set.isCompleted}
                                                    />
                                                </View>
                                                {/* Weight Input */}
                                                <View className='flex-1 mx-2'>
                                                    <Text className='text-xs text-gray-500 mb-1'>
                                                        Weight ({weightUnit})
                                                    </Text>
                                                    <TextInput
                                                        value={set.weight}
                                                        onChangeText={(value) => updateSet(
                                                            exercise.id, set.id, 'weight', value
                                                        )}
                                                        placeholder='0'
                                                        keyboardType='numeric'
                                                        className={`border rounded-lg px-3 py-2
                                                            text-center ${set.isCompleted ?
                                                                'bg-gray-100 border-gray-300 text-gray-500'
                                                                : 'bg-white border-gray-300'
                                                            }`}
                                                        editable={!set.isCompleted}
                                                    />
                                                </View>
                                                {/* Complete buton */}
                                                <TouchableOpacity
                                                    onPress={() => toggleSetCompletion(exercise.id, set.id)}
                                                    className={`w-12 h-12 rounded-xl items-center
                                                    justify-center mx-1 ${set.isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                                        }`}>
                                                    <Ionicons name={set.isCompleted ?
                                                        'checkmark' :
                                                        'checkmark-outline'}
                                                        size={20}
                                                        color={set.isCompleted ? 'white' : '#9CA3AF'}
                                                    />
                                                </TouchableOpacity>

                                                {/* Delete Button */}
                                                <TouchableOpacity
                                                    onPress={() => deleteSet(exercise.id, set.id)}
                                                    className='w-12 h-12 rounded-xl items-center
                                                    justify-center bg-red-500 ml-1'
                                                >
                                                    <Ionicons name='trash' size={16} color='white' />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                    )}

                                    {/* Add New Set Button */}
                                    <TouchableOpacity
                                        onPress={() => addNewSet(exercise.id)}
                                        className='bg-orange-100 border-2 border-dashed
                                        border-orange-300 rounded-lg py-3 items-center mt-2'
                                    >
                                        <View className='flex-row items-center'>
                                            <Ionicons name='add' size={16} color='#3b82f6'
                                                style={{ marginRight: 6 }} />
                                            <Text className='text-orange-600 font-medium'>
                                                Add Set
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                </View>
                            </View>

                        ))}



                        {/* Add exercise button */}
                        <TouchableOpacity
                            onPress={addExercise}
                            className='bg-orange-600 rounded-2xl py-4 items-center 
                                        mb-8 active:bg-orange-700'
                            activeOpacity={0.8}
                        >
                            <View className='flex-row items-center'>
                                <Ionicons name='add' size={20} color='white'
                                    style={{ marginRight: 8 }} />
                                <Text className='text-white font-semibold text-lg'>
                                    Add Exercise
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Workout Completion button */}

                        <TouchableOpacity
                            onPress={saveWorkout}
                            className={`rounded-2xl py-4 items-center mb-8
                            ${isSaving || workoutExercises.length === 0 ||
                                    workoutExercises.some((exercise) => exercise.
                                        sets.some((set) => !set.isCompleted)) ? 'bg-gray-400' :
                                    'bg-green-600 active:bg-green-700'
                                }`}
                            disabled={isSaving || workoutExercises.length === 0 ||
                                workoutExercises.some((exercise) => exercise.sets.some
                                    ((set) => !set.isCompleted))
                            }
                        >
                            {isSaving ? (
                                <View className='flex-row items-center'>
                                    <ActivityIndicator size='small' color='white' />
                                    <Text className='text-white font-semibold
                                    text-lg ml-2'> Saving... </Text>
                                </View>
                            ) : (
                                <Text className='text-white font-semibold text-lg'>
                                    Complete Workout
                                </Text>
                            )}
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
