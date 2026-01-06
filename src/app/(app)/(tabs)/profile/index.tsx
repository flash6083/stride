import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from "react-native";

export default function Page() {
  return (
    <SafeAreaView className="flex flex-1">
      <Text>Profile</Text>
    </SafeAreaView>
  );
}
