import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useClerk } from '@clerk/clerk-expo'

export default function ProfilePage() {

  const { signOut } = useClerk()

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => await signOut()
      }
    ]);
  }

  return (
    <SafeAreaView className="flex flex-1">
      <Text>Profile</Text>

      {/*Sign out*/}

      <View className="px-6 mb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-600 rounded-2xl p-4 shadow-sm"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={24} color="white" className="mr-2" />
            <Text className="text-white font-semibold text-lg">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>


    </SafeAreaView>
  );
}