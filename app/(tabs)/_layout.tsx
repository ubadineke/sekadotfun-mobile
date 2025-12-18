import { Tabs } from 'expo-router'
import React from 'react'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* The index redirects to the home screen */}
      <Tabs.Screen name="index" options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <UiIconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UiIconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          href: null, // Hide from tab bar (accessed via navigation)
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          href: null,
          title: 'Account',
          tabBarIcon: ({ color }) => <UiIconSymbol size={28} name="wallet.pass.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Settings',
          tabBarIcon: ({ color }) => <UiIconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="demo"
        options={{
          href: null,
          title: 'Demo',
          tabBarIcon: ({ color }) => <UiIconSymbol size={28} name="ladybug.fill" color={color} />,
        }}
      />
    </Tabs>
  )
}
