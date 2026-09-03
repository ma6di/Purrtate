import { Tabs } from 'expo-router';

import { PurrTabBar } from '@/components/PurrTabBar';
import { colors } from '@/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PurrTabBar state={props.state} navigation={props.navigation} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.cream },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="toys" options={{ title: 'Toys' }} />
      <Tabs.Screen name="play" options={{ title: 'Play' }} />
      <Tabs.Screen name="insights" options={{ title: 'Den' }} />
    </Tabs>
  );
}
