import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'

const RootLayout = () => {
  return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home'}} />
            <Stack.Screen name="about" options={{ title: 'About'}} />
            <Stack.Screen name="signup" options={{ title: 'Sign Up'}} />
            <Stack.Screen name="login" options={{ title: 'Log In'}} />
            <Stack.Screen name="forgotpassword" options={{ title: 'Forgot Password'}} />
        </Stack>
  )
}

export default RootLayout

const styles = StyleSheet.create({})