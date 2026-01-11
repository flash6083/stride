import * as React from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSignUp } from '@clerk/clerk-expo'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState(false)
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)

  // ---------------- SIGN UP ----------------
  const onSignUpPress = async () => {
    if (!isLoaded) return

    if (!emailAddress || !password) {
      Alert.alert('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    try {
      await signUp.create({ emailAddress, password })
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })
      setPendingVerification(true)
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
      Alert.alert('Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  // ---------------- VERIFY ----------------
  const onVerifyPress = async () => {
    if (!isLoaded) return

    if (!code) {
      Alert.alert('Please enter the verification code.')
      return
    }

    setIsLoading(true)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(result, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
      Alert.alert('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* ---------------- HEADER ---------------- */}
          <View className="flex-1 justify-center">
            <View className="items-center">
              <View
                className="w-20 h-20 bg-gradient-to-br
                from-orange-400 to-red-500 rounded-full 
                items-center justify-center mb-3
                shadow-lg shadow-orange-200"
              >
                <Ionicons
                  name={pendingVerification ? 'mail' : 'fitness'}
                  size={40}
                  color="#F54927"
                />
              </View>
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-5">
              {pendingVerification ? 'Check Your Email' : 'Join Stride'}
            </Text>

            <Text className="text-lg text-gray-600 text-center mb-3">
              {pendingVerification
                ? `We've sent a verification code to\n${emailAddress}`
                : 'Start your fitness journey \n and achieve your goals.'}
            </Text>

            {/* ---------------- CARD ---------------- */}
            <View
              className="bg-white rounded-2xl p-6 shadow-sm border
              border-gray-100 my-6"
            >
              {!pendingVerification ? (
                <>
                  <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Create your Account
                  </Text>

                  {/* Email */}
                  <View
                    className="flex-row items-center bg-gray-50 rounded-xl px-4
                    py-4 border border-gray-200 mb-6"
                  >
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={emailAddress}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={setEmailAddress}
                      className="ml-3 flex-1 text-gray-900"
                      editable={!isLoading}
                    />
                  </View>

                  {/* Password */}
                  <View>
                    <View
                      className="flex-row items-center bg-gray-50 rounded-xl px-4
                      py-4 border border-gray-200 mb-2"
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#9CA3AF"
                      />
                      <TextInput
                        value={password}
                        placeholder="Create a password"
                        placeholderTextColor="#9CA3AF"
                        onChangeText={setPassword}
                        secureTextEntry
                        className="ml-3 flex-1 text-gray-900"
                        editable={!isLoading}
                      />
                    </View>
                    <Text className="text-xs text-gray-400">
                      Password must be at least 8 characters long.
                    </Text>
                  </View>

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    className={`bg-gradient-to-r from-orange-400 to-red-500 rounded-xl 
                      py-4 mb-4 mt-6 shadow-lg shadow-orange-200
                       ${isLoading ? 'bg-gray-400' : 'bg-orange-500'}`}
                    onPress={onSignUpPress}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-center">
                      {isLoading ? (
                        <Ionicons name="hourglass" size={20} color="white" />
                      ) : (
                        <Ionicons
                          name="person-add-outline"
                          size={20}
                          color="white"
                        />
                      )}
                      <Text className="text-white text-lg font-semibold ml-2">
                        {isLoading
                          ? 'Creating Account...'
                          : 'Create Account'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Terms */}
                  <Text className="text-center text-gray-400 text-sm mt-2">
                    By signing up, you agree to our{' '}
                    <Text className="text-orange-500">Terms of Service</Text> and{' '}
                    <Text className="text-orange-500">Privacy Policy</Text>.
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Verify Your Email
                  </Text>

                  <Text className="text-gray-600 mb-4">
                    Enter the verification code below to complete your sign-up.
                  </Text>

                  {/* Code */}
                  <View
                    className="flex-row items-center bg-gray-50 rounded-xl px-4
                    py-4 border border-gray-200 mb-6"
                  >
                    <Ionicons name="key-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={setCode}
                      className="ml-3 flex-1 text-gray-900"
                      editable={!isLoading}
                    />
                  </View>

                  {/* Verify Button */}
                  <TouchableOpacity
                    className={`bg-gradient-to-r from-orange-400 to-red-500 rounded-xl 
                      py-4 mt-2 shadow-lg shadow-orange-200
                       ${isLoading ? 'bg-gray-400' : 'bg-orange-500'}`}
                    onPress={onVerifyPress}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-center">
                      {isLoading ? (
                        <Ionicons name="hourglass" size={20} color="white" />
                      ) : (
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="white"
                        />
                      )}
                      <Text className="text-white text-lg font-semibold ml-2">
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity className="mt-4">
                    <Text className="text-center text-orange-500 font-medium">
                      Didn’t receive the code? Resend
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Sign In link */}
            {!pendingVerification && (
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/sign-in')}>
                  <Text className="text-orange-500 font-semibold">Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ---------------- FOOTER ---------------- */}
          <View className="items-center pb-6">
            <Text className="text-gray-400 text-center text-sm">
              Ready to take the first step towards{'\n'}a healthier you?
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
