import {
    View, Text, Modal, TouchableOpacity, TextInput, FlatList,
    RefreshControl, Alert
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { useWorkoutStore } from 'store/workout-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ExerciseCard from './ExerciseCard';
import { Exercise } from '@/lib/sanity/types';
import { sanityClient } from '@/lib/sanity/client';
import { EXERCISE_QUERY } from '@/lib/sanity/queries';


interface ExerciseSelectionModalProps {
    visible: boolean;
    onClose: () => void;
}

const ExerciseSelectionModal = ({ visible, onClose }: ExerciseSelectionModalProps) => {

    const router = useRouter();
    const { addExerciseToWorkout } = useWorkoutStore();
    const [exercises, setExercises] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchExercises = async () => {
        try {
            const exercises = await sanityClient.fetch(EXERCISE_QUERY);
            setExercises(exercises);
            setFilteredExercises(exercises);
        } catch (error) {
            Alert.alert('Error',
                'Failed to fetch exercises. Please try again later.');
            console.log('Error fetching exercises:', error);
        }
    }

    const handleExercisePress = (exercise: Exercise) => {
        // Directly add exercise to workout
        addExerciseToWorkout({ name: exercise.name, sanityId: exercise._id });
        onClose();
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchExercises();
        setRefreshing(false);
    }

    useEffect(() => {
        if (visible) {
            fetchExercises();
        }
    }, [visible]);

    useEffect(() => {
        const filtered = exercises.filter((exercise) =>
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredExercises(filtered);
    }, [searchQuery, exercises])

    return (
        <Modal visible={visible} animationType='slide' presentationStyle='pageSheet'
            onRequestClose={onClose}>
            <SafeAreaView className='flex-1 bg-white'>

                {/*Header*/}
                <View className='bg-white px-4 pt-4 pb-6 shadow-sm border-b
                border-gray-100'>
                    <View className='flex-row items-center justify-between mb-4'>
                        <Text className='text-2xl font-bold text-gray-800'>
                            Add Exercise
                        </Text>
                        <TouchableOpacity onPress={onClose}
                            className='w-8 h-8 items-center justify-center'>
                            <Ionicons name='close' size={24} color='#6b7280' />
                        </TouchableOpacity>
                    </View>

                    <Text className='text-gray-600 mb-4'>
                        Tap any exercise to add it to your workout
                    </Text>

                    {/*Search bar*/}
                    <View className='flex-row items-center bg-gray-100 rounded-xl
                    px-4 py-3'>
                        <Ionicons name='search' size={20} color='#9ca3af' />
                        <TextInput
                            className='flex-1 ml-3 text-gray-800'
                            placeholder='Search exercises...'
                            placeholderTextColor='#9ca3af'
                            value={searchQuery}
                            onChangeText={setSearchQuery} />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name='close-circle' size={20}
                                    color='#6b7280' />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/*Exercises list*/}

                <FlatList
                    data={filteredExercises}
                    renderItem={({ item }) => (
                        <ExerciseCard item={item}
                            onPress={() => handleExercisePress(item)}
                            showChevron={false} />
                    )}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 16,
                        paddingBottom: 32,
                        paddingHorizontal: 16
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3b82f6']}
                            tintColor='#3b82f6'
                        />
                    }
                    ListEmptyComponent={
                        <View className='flex-1 items-center justify-center py-20'>
                            <Ionicons name='fitness-outline' size={64}
                                color='#d1dbd5' />
                            <Text className='text-lg font-semibold text-gray-400
                            mt-4'>
                                {searchQuery ? 'No exercises found' : 'Loading exercises...'}
                            </Text>
                            <Text className='text-sm text-gray-400 mt-2'>
                                {searchQuery ? 'Try adjusting your search' :
                                    'Please wait a moment'}
                            </Text>
                        </View>
                    }
                />

            </SafeAreaView>
        </Modal>
    )
}

export default ExerciseSelectionModal