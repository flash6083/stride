import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native'
import { useState, useCallback, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ExerciseCard from '@/app/components/ExerciseCard';
import { sanityClient } from '@/lib/sanity/client';
import { Exercise } from '@/lib/sanity/types';
import { EXERCISE_QUERY } from '@/lib/sanity/queries';

const Exercises = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

    const router = useRouter();

    const fetchExercises = async () => {
        try {
            const exercises = await sanityClient.fetch(EXERCISE_QUERY);
            setExercises(exercises);
            setFilteredExercises(exercises);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch exercises. Please try again later.');
            console.error('Error fetching exercises:', error);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        const filtered = exercises.filter((exercise: Exercise) =>
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredExercises(filtered);
    }, [searchQuery, exercises]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchExercises();
        setRefreshing(false);
    }, []);
    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            {/* Header */}
            <View className='px-6 py-4 bg-white border-b border-gray-200'>
                <Text className='text-2xl font-semibold text-gray-800'>
                    Exercise Library
                </Text>
                <Text className='text-gray-400 mt-1'>
                    Browse and search exercises to add to your workout routines.
                </Text>
                {/*Serch bar*/}
                <View className='flex-row items-center bg-gray-100 rounded-xl 
                px-4 py-3 mt-4'>
                    <Ionicons name='search' size={20} color='#9CA3AF' />
                    <TextInput
                        className='flex-1 ml-3 text-gray-800'
                        placeholder='Search exercises'
                        placeholderTextColor='#9CA3AF'
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name='close-circle' size={20} color='#9CA3AF' />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {/* Exercise list*/}
            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                renderItem={({ item }) => (
                    <ExerciseCard
                        item={item}
                        onPress={() => router.push(`/exercise-detail?id=${item._id}`)}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#2563EB']}
                        tintColor='#2563EB'
                        title='Pull to refresh exercise'
                        titleColor='#63B3EB'
                    />
                }
                ListEmptyComponent={
                    <View className='bg-white rounded-2xl p-8 items-center'>
                        <Ionicons name='barbell' size={64} color='#9CA3AF' />
                        <Text className='text-xl font-semibold text-gray-800 
                        mt-4 text-center'>
                            {searchQuery ? 'No exercises found' :
                                'Loading exercises...'}
                        </Text>
                        <Text className='text-gray-500 mt-2 text-center'>
                            {searchQuery ? 'Try adjusting your search' :
                                'Please wait while we load the exercise library.'}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    )
}

export default Exercises;
