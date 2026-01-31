import { View, Text, Alert } from 'react-native'
import React, { use, useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { sanityClient } from '@/lib/sanity/client'
import { SINGLE_WORKOUT_QUERY } from '@/lib/sanity/queries'
import { Workout } from '@/lib/sanity/types'

const WorkoutRecord = () => {
    const { workoutId } = useLocalSearchParams()

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [workout, setWorkout] = useState<Workout | null>();

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
    }, [workoutId])
    return (
        <View>
            <Text>WorkoutRecord</Text>
        </View>
    )
}

export default WorkoutRecord