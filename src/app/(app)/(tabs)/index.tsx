import { Link } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Pressable, TouchableOpacity } from "react-native";
import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

export default function Page() {
  return (
    <SafeAreaView className="flex flex-1">
      <Header />
      <Content />
    </SafeAreaView>
  );
}

function Content() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      router.replace('/')
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }
  return (
    <View className="flex-1">
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="px-4 md:px-6">
          <View className="flex flex-col items-center gap-4 text-center">
            <Text className="text-3xl native:text-5xl font-bold tracking-tighter text-center">
              Expo + Tailwind (NativeWind) Template
            </Text>

            <Text className="max-w-[700px] text-lg md:text-xl text-center">
              This template sets up Expo and Tailwind (NativeWind) allowing you
              to quickly get started with my YouTube tutorial!
            </Text>

            {/* Simple text link */}
            <Link href="https://www.youtube.com/@sonnysangha" asChild>
              <Pressable>
                <Text className="text-lg text-blue-500 underline md:text-xl dark:text-blue-400">
                  https://www.youtube.com/@sonnysangha
                </Text>
              </Pressable>
            </Link>

            {/* Button-style links */}
            <View className="gap-4 w-full items-center">
              <Link href="https://www.youtube.com/@sonnysangha" asChild>
                <Pressable className="h-9 px-4 rounded-md bg-gray-900 items-center justify-center active:bg-gray-700">
                  <Text className="text-sm font-medium text-gray-50">
                    Visit my YouTube Channel
                  </Text>
                </Pressable>
              </Link>

              <Link href="https://www.papareact.com/course" asChild>
                <Pressable className="h-9 px-4 rounded-md bg-red-700 items-center justify-center active:bg-red-600">
                  <Text className="text-sm font-medium text-gray-50">
                    Get the Complete Source Code (Plus 60+ builds) ❤️
                  </Text>
                </Pressable>
              </Link>

              <Link href="https://www.papareact.com/course" asChild>
                <Pressable className="h-9 px-4 rounded-md bg-green-700 items-center justify-center active:bg-green-600">
                  <Text className="text-sm font-medium text-gray-50">
                    Join My Course & Learn to Code with AI 💚 (1000+ Students)
                  </Text>
                </Pressable>
              </Link>
              <TouchableOpacity onPress={handleSignOut}>
                <Text>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Header() {
  return (
    <View className="px-4 lg:px-6 h-14 flex flex-row items-center justify-between">
      <Link href="/" asChild>
        <Pressable>
          <Text className="font-bold text-lg">PAPAFAM</Text>
        </Pressable>
      </Link>

      <Link href="https://www.papareact.com/course" asChild>
        <Pressable>
          <Text className="text-md font-medium underline">
            Join My Course ❤️
          </Text>
        </Pressable>
      </Link>


    </View>
  );
}
