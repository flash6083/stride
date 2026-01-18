import { View, Text, TouchableOpacity, Alert, ScrollView, Image, Linking, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Exercise } from '@/lib/sanity/types'
import Markdown from "react-native-markdown-display";
import { sanityClient, urlFor } from '@/lib/sanity/client'
import { SINGLE_EXERCISE_QUERY } from '@/lib/sanity/queries'
import { getDifficultyText, getDifficultyColor } from '../components/ExerciseCard'

const ExerciseDetail = () => {
    const router = useRouter();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [aiGuidance, setAIGuidance] = useState<string | null>(null);
    const [aiLoading, setAILoading] = useState<boolean>(false);

    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        const fetchExercise = async () => {
            if (!id) {
                Alert.alert('Error', 'No exercise ID provided');
                return;
            }
            try {
                const exerciseData = await sanityClient.fetch(SINGLE_EXERCISE_QUERY, { id });
                setExercise(exerciseData);
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch exercise details. Please try again later.');
                console.error('Error fetching exercise details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExercise();
    }, [id]);

    const getAIGudidance = async () => {
        if (!exercise) {
            Alert.alert('Error', 'Exercise data is not available for AI guidance.');
            return;
        }
        setAILoading(true);
        try {
            const response = await fetch("/api/ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    exerciseName: exercise.name,
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch AI guidance');
            }
            const data = await response.json();
            setAIGuidance(data.message);
        } catch (error) {
            Alert.alert('Error', 'Failed to get AI guidance. Please try again later.');
            console.error('Error fetching AI guidance:', error);
            setAIGuidance('Failed to get AI guidance. Please try again later.');
        } finally {
            setAILoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {
                loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#EF4444" />
                        <Text className="mt-4 text-gray-600 text-base">
                            Loading exercise details...
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Header */}
                        <View className='absolute top-12 left-0 right-0 z-10 px-4'>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className='w-10 h-10 bg-black/20 rounded-full items-center justify-center backdrop-blur-sm'
                            >
                                <Ionicons name='chevron-back' size={24} color='white' />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                            {/* Hero Image */}
                            <View className='h-80 bg-white relative'>
                                {
                                    exercise?.image ? (
                                        <Image
                                            source={{
                                                uri: urlFor(exercise.image.asset._ref).url()
                                            }}
                                            className='w-full h-full'
                                            resizeMode='contain'
                                        />
                                    ) : (
                                        <View className='w-full h-full bg-gradient-to-br from-orange-400 to-rose-600 items-center justify-center'>
                                            <Ionicons name='barbell' size={100} color='white' />
                                        </View>
                                    )
                                }

                                {/* Gradient Overlay */}
                                <View className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent' />
                            </View>

                            {/* Content */}
                            <View className='px-6 py-6'>
                                {/* Title & Difficulty */}
                                <View className='flex-row items-start justify-between mb-4'>
                                    <View className='flex-1 mr-4'>
                                        <Text className='text-3xl font-bold text-gray-800 mb-2'>
                                            {exercise?.name || 'Exercise name not available'}
                                        </Text>
                                        <View
                                            className={`self-start px-4 py-2 rounded-full ${getDifficultyColor(exercise?.difficulty)}`}
                                        >
                                            <Text className={`text-sm font-semibold 
                                                ${getDifficultyText(exercise?.difficulty)}`}>
                                                {exercise?.difficulty || 'Difficulty N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Description */}
                                <View className='mb-6'>
                                    <Text className='text-xl font-semibold text-gray-800 mb-3'>
                                        Description
                                    </Text>
                                    <Text className='text-gray-600 text-base leading-7'>
                                        {exercise?.description || 'No description available for this exercise.'}
                                    </Text>
                                </View>

                                {/* Video */}
                                {exercise?.videoUrl && (
                                    <View className='mb-6'>
                                        <Text className='text-xl font-semibold text-gray-800 mb-3'>
                                            Video Tutorial
                                        </Text>
                                        <TouchableOpacity
                                            className='bg-orange-500 rounded-xl p-4 flex-row items-center'
                                            onPress={() => Linking.openURL(exercise?.videoUrl)}
                                        >
                                            <View className='w-12 h-12 bg-white rounded-full items-center justify-center mr-4'>
                                                <Ionicons name='play' size={24} color='#EF4444' />
                                            </View>
                                            <View>
                                                <Text className='text-white font-semibold text-lg'>
                                                    Watch Tutorial
                                                </Text>
                                                <Text className='text-red-100 text-sm'>
                                                    Learn proper form and technique
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {/* AI Guidance*/}

                                {(aiGuidance || aiLoading) && (
                                    <View className='mb-6'>
                                        <View className='flex-row items-center mb-3'>
                                            <Ionicons name='bulb' size={24} color='#F59E0B' />
                                            <Text className='text-xl font-semibold text-gray-800 ml-2'>
                                                AI Fitness Coach Says ...
                                            </Text>
                                        </View>
                                        {aiLoading ? (
                                            <View className='bg-gray-50 rounded-xl p-4 items-center'>
                                                <ActivityIndicator size='small' color='#EF4444' />
                                                <Text className='text-gray-600 font-medium mt-2'>
                                                    Generating AI guidance...
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className='bg-orange-50 rounded-xl p-4 border-orange-500'>
                                                <Markdown style={{
                                                    body: {
                                                        paddingBottom: 20,
                                                    },
                                                    heading2: {
                                                        fontSize: 18,
                                                        fontWeight: 'bold',
                                                        color: '#1f2937',
                                                        marginTop: 12,
                                                        marginBottom: 6
                                                    },
                                                    heading3: {
                                                        fontSize: 16,
                                                        fontWeight: 600,
                                                        color: '#374151',
                                                        marginTop: 8,
                                                        marginBottom: 4
                                                    }
                                                }}>
                                                    {aiGuidance || ''}
                                                </Markdown>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* -------------- */}

                                {/*Action Buttons*/}
                                <View className='mt-8 gap-2'>
                                    {/*AI Coach Button*/}
                                    <TouchableOpacity className={`rounded-xl py-4
                                        items-center ${aiLoading ? "bg-gray-400"
                                            : aiGuidance ? "bg-green-500"
                                                : "bg-indigo-600"
                                        }`}
                                        onPress={getAIGudidance}
                                        disabled={aiLoading}
                                    >
                                        {
                                            aiLoading ? (
                                                <View className='flex-row items-center'>
                                                    <ActivityIndicator size='small' color='white' />
                                                    <Text className='text-white font-bold text-lg ml-2'>
                                                        Loading ...
                                                    </Text>
                                                </View>
                                            ) : (
                                                <Text className='text-white font-bold text-lg'>
                                                    {aiGuidance ? "Refresh AI Guidance" : "Get AI Guidance"}
                                                </Text>
                                            )
                                        }
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className='bg-gray-200 rounded-xl py-4 items-center'
                                        onPress={() => router.back()}>
                                        <Text className='text-gray-800 font-bold text-lg'>
                                            Close
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </>
                )
            }
        </SafeAreaView>
    );

}

export default ExerciseDetail