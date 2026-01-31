import React from 'react'
import { Stack } from 'expo-router'

const Layout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name='workout-record' options=
                {{
                    headerShown: true, headerTitle: 'Workout Record',
                    headerBackTitle: 'History'
                }} />
        </Stack>
    )

}

export default Layout