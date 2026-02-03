import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Workout() {
    const router = useRouter();
    const startWorkout = () => {
        router.push('/active-workout');
    }
    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            {/* Main Start workout screen*/}
            <View className='flex-1 px-6'>
                {/*Header*/}
                <View className='pt-8 pb-6'>
                    <Text className='text-3xl font-bold text-gray-900 mb-2'>
                        Ready to train?
                    </Text>
                    <Text className='text-lg text-gray-600'>
                        Start your workout session
                    </Text>
                </View>
            </View>

            {/* Generic start workout card*/}
            <View className='bg-white rounded-3xl p-6 shadow-sm border 
            border-gray-100 mx-6 mb-8'>
                <View className='flex-row items-center justify-between mb-6'>
                    <View className='flex-row items-center'>
                        <View className='w-12 h-12 bg-orange-100 rounded-full 
                         justify-center items-center mr-3'>
                            <Ionicons name='fitness' size={24} color='#FF5533' />
                        </View>
                        <View>
                            <Text className='text-lg font-semibold text-gray-900 mb-1'>
                                Start Workout
                            </Text>
                            <Text className='text-sm text-gray-600'>
                                Begin your workout session
                            </Text>
                        </View>
                    </View>
                    <View className='bg-green-100 px-3 py-1 rounded-full'>
                        <Text className='text-green-700 font-medium text-sm'>Ready</Text>
                    </View>
                </View>

                {/* Start button*/}
                <TouchableOpacity
                    onPress={startWorkout}
                    className='bg-orange-600 rounded-2xl py-4 items-center
                active:bg-orange-700'
                    activeOpacity={0.8}>
                    <View className='flex-row items-center'>
                        <Ionicons
                            name='play'
                            size={20}
                            color='white'
                            style={{ marginRight: 6 }} />
                        <Text className='text-white font-semibold text-lg'>
                            Start Workout
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
