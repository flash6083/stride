import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Exercise } from '@/lib/sanity/types'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { urlFor } from '@/lib/sanity/client';

export const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'bg-emerald-50'
        case 'intermediate':
            return 'bg-amber-50'
        case 'advanced':
            return 'bg-rose-50'
        default:
            return 'bg-gray-50'
    }
}

export const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'text-emerald-700'
        case 'intermediate':
            return 'text-amber-700'
        case 'advanced':
            return 'text-rose-700'
        default:
            return 'text-gray-700'
    }
}

const getDifficultyDot = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'bg-emerald-500'
        case 'intermediate':
            return 'bg-amber-500'
        case 'advanced':
            return 'bg-rose-500'
        default:
            return 'bg-gray-500'
    }
}

interface ExerciseCardProps {
    item: Exercise,
    onPress: () => void,
    showChevron?: boolean
}

const ExerciseCard = ({
    item,
    onPress,
    showChevron = false
}: ExerciseCardProps) => {
    return (

        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-xl mb-4 border border-gray-100"
        >
            <View className="flex-row px-5 py-5">
                <View className="w-24 h-24 bg-gray-50 rounded-2xl mr-4 overflow-hidden">
                    {item.image ? (
                        <Image
                            source={{ uri: urlFor(item.image?.asset?._ref).url() }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 justify-center items-center">
                            <Ionicons name="barbell" size={36} color="white" />
                        </View>
                    )}
                </View>

                <View className="flex-1 justify-between">
                    <View>
                        <Text className="text-lg font-bold text-gray-900 mb-1.5">
                            {item.name}
                        </Text>
                        <Text
                            className="text-sm text-gray-500"
                            numberOfLines={2}
                        >
                            {item.description || 'No description available.'}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                        <View className="flex-row items-center gap-2">
                            <View className={`w-2 h-2 rounded-full ${getDifficultyDot(item.difficulty)}`} />
                            <View className={`px-3.5 py-1.5 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                                <Text className={`text-xs font-bold uppercase ${getDifficultyText(item.difficulty)}`}>
                                    {item.difficulty}
                                </Text>
                            </View>
                        </View>

                        {showChevron && (
                            <TouchableOpacity className="p-2">
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ExerciseCard