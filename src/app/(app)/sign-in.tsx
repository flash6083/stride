import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import GoogleSignIn from '../components/GoogleSignIn'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')


  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <SafeAreaView className='flex-1'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'>
        {/* Header section*/}
        <View className=' flex-1 px-6'>
          <View className='flex-1 justify-center'>
            <View className='items-center'>
              <View className='w-20 h-20 bg-gradient-to-br
                      from-orange-400 to-red-500 rounded-full 
                      items-center justify-center mb-3
                      shadow-lg shadow-orange-200'>
                <Ionicons name="fitness" size={40} color="#F54927" />
              </View>
            </View>
            <Text className='text-3xl font-bold text-gray-900 text-center mb-5'>
              Stride
            </Text>
            <Text className='text-lg text-gray-600 text-center mb-3'>
              Track your fitness journey {"\n"} and achieve your goals.
            </Text>

            {/* Sign In Form */}

            <View className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100
              my-6 '>
              <Text className='text-2xl font-bold text-gray-900 mb-6 text-center'>
                Welcome Back
              </Text>
              {/* Email Address Input */}
              <View className='flex-row items-center bg-gray-50 rounded-xl px-4
                  py-4 border border-gray-200 mb-6'>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  autoCapitalize='none'
                  value={emailAddress}
                  placeholder='Enter your email'
                  placeholderTextColor='#9CA3AF'
                  onChangeText={setEmailAddress}
                  className='flex-1 ml-3 text-gray-900'
                  editable={!isLoading}
                />
              </View>

              {/* Password Address Input */}
              <View className='flex-row items-center bg-gray-50 rounded-xl px-4
                  py-4 border border-gray-200 mb-6'>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  value={password}
                  placeholder='Enter your password'
                  placeholderTextColor='#9CA3AF'
                  onChangeText={setPassword}
                  className='flex-1 ml-3 text-gray-900'
                  editable={!isLoading}
                />
              </View>
            </View>
            {/*Sign In button */}

            <TouchableOpacity
              className={`bg-gradient-to-r from-orange-400 to-red-500 rounded-xl 
                py-4 mb-4 shadow-lg shadow-orange-200
                ${isLoading ? 'bg-gray-400' : 'bg-orange-500'}`}
              onPress={onSignInPress}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View className='flex-row items-center justify-center'>
                {isLoading ? (
                  <Ionicons name="hourglass" size={24} color="white" className='self-center' />
                ) :
                  (<Ionicons name="log-in-outline" size={24} color="white" className='self-center' />)}
                <Text className='text-white text-center text-lg font-semibold ml-2'>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}

            <View className='flex-row items-center justify-center my-3'>
              <View className='h-px w-full bg-gray-200' />
              <Text className='text-gray-500 font-semibold mx-4'>or</Text>
              <View className='h-px w-full bg-gray-200' />
            </View>

            {/* Google Sign In Button */}

            <GoogleSignIn />
            {/*Sign Up Link */}
            <View className='flex-row justify-center items-center mt-6'>
              <Text className='text-gray-600'>Don't have an account?</Text>
              <Link href="/sign-up" asChild>
                <TouchableOpacity>
                  <Text className='text-orange-500 font-semibold ml-2'>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>


          {/* Footer Section */}

          <View className='pb-6'>
            <Text className='text-center text-gray-600 text-sm'>
              Start your fitness journey with Stride.
            </Text>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}