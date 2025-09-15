import { Buffer } from 'buffer'
import { Redirect } from 'expo-router'
import 'react-native-get-random-values'
import 'text-encoding-polyfill'

global.Buffer = Buffer
export default function TabsIndexScreen() {
  return <Redirect href="/(tabs)/home" />
}
