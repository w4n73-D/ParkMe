import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'

const RootLayout = () => {
  return (
        <Tabs>
            <Tabs.Screen name="freelots" options={{ title: 'Free Lots'}} />
            <Tabs.Screen name="dashboard" options={{ title: 'Dashboard'}} />
            <Tabs.Screen name="account" options={{ title: 'Account'}} />
        </Tabs>
  )
}

export default RootLayout

const styles = StyleSheet.create({})