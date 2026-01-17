import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const Exercises = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
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
        </SafeAreaView>
    )
}

export default Exercises;
