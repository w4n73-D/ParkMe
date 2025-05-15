import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'

const RootLayout = () => {
  return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false}} />
            <Stack.Screen name="about" options={{ title: 'About', headerShown: false}} />
            <Stack.Screen name="signup" options={{ title: 'Sign Up', headerShown: false}} />
            <Stack.Screen name="login" options={{ title: 'Log In', headerShown: false}} />
            <Stack.Screen name="forgotpassword" options={{ title: 'Forgot Password', headerShown: false}} />
        </Stack>
  )
}

export default RootLayout

const styles = StyleSheet.create({})