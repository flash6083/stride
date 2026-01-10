import * as React from 'react'
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView className='flex-1 bg-gray-50'>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className='flex-1'>

          <View className='flex-1 px-6'>
            <View className='flex-1 justify-center'>
              {/*Logo Branding  */}
              <View className='items-center'>
                <View className='w-20 h-20 bg-gradient-to-br
                from-orange-400 to-red-500 rounded-full 
                items-center justify-center mb-3
                shadow-lg shadow-orange-200'>
                  <Ionicons name="mail" size={40} color="#F54927" />
                </View>
              </View>
              <Text className='text-3xl font-bold text-gray-900 text-center mb-5'>
                Check Your Email
              </Text>
              <Text className='text-lg text-gray-600 text-center mb-3'>
                We've sent a verification code to {'\n'}
                {emailAddress}
              </Text>

            </View>
          </View>



          <Text>Verify your email</Text>
          <TextInput
            value={code}
            placeholder="Enter your verification code"
            onChangeText={(code) => setCode(code)}
          />
          <TouchableOpacity onPress={onVerifyPress}>
            <Text>Verify</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'>

        <View className='flex-1 px-6'>
          {/* Main content  */}
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
              Join Stride
            </Text>
            <Text className='text-lg text-gray-600 text-center mb-3'>
              Start your fitness journey {"\n"} and achieve your goals.
            </Text>

            {/* Sign Up Form  */}
            <View className='bg-white rounded-2xl p-6 shadow-sm border
              border-gray-100 my-6 '>
              <Text className='text-2xl font-bold text-gray-900 mb-6 text-center'>
                Create your Account
              </Text>
              {/* Email Address Input  */}
              <View className='flex-row items-center bg-gray-50 rounded-xl px-4
                  py-4 border border-gray-200 mb-6'>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  autoCapitalize='none'
                  value={emailAddress}
                  placeholder='Enter your email'
                  placeholderTextColor='#9CA3AF'
                  onChangeText={setEmailAddress}
                  className='ml-3 flex-1 text-gray-900'
                  editable={!isLoading}
                />
              </View>

              {/* Password Input  */}
              <View>
                <View className='flex-row items-center bg-gray-50 rounded-xl px-4
                    py-4 border border-gray-200 mb-2'>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    value={password}
                    placeholder='Create a password'
                    placeholderTextColor='#9CA3AF'
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    className='ml-3 flex-1 text-gray-900'
                    editable={!isLoading}
                  />
                </View>
                <Text className='text-xs text-gray-400'>
                  Password must be at least 8 characters long.
                </Text>
              </View>

              {/* Sign Up Button  */}
              <TouchableOpacity
                className={`bg-gradient-to-r from-orange-400 to-red-500 rounded-xl 
                              py-4 mb-4 mt-6 shadow-lg shadow-orange-200
                              ${isLoading ? 'bg-gray-400' : 'bg-orange-500'}`}
                onPress={onSignUpPress}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View className='flex-row items-center justify-center'>
                  {isLoading ? (
                    <Ionicons name="hourglass" size={20} color="white" className='self-center' />
                  ) :
                    (<Ionicons name="person-add-outline" size={20} color="white" className='self-center' />)}
                  <Text className='text-white text-center text-lg font-semibold ml-2'>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </View>
              </TouchableOpacity>
              {/*Terms and Privacy Policy  */}
              <View className='mt-2'>
                <Text className='text-center text-gray-400 text-sm'>
                  By signing up, you agree to our{' '}
                  <Text className='text-orange-500'>Terms of Service</Text> and{' '}
                  <Text className='text-orange-500'>Privacy Policy</Text>.
                </Text>
              </View>

            </View>
            {/*Sign In Link  */}
            <View className='flex-row justify-center items-center'>
              <Text className='text-gray-600'>Already have an account? </Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity>
                  <Text className='text-orange-500 font-semibold'>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Footer section  */}

          <View className='items-center pb-6'>
            <Text className='text-gray-400 text-center text-sm'>
              Ready to take the first step towards {"\n"} a healthier you?
            </Text>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}