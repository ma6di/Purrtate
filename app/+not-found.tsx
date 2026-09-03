import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PawButton } from '@/components/ui/PawButton';
import { Body, Display } from '@/components/ui/Type';
import { colors } from '@/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Display>This yarn rolled away.</Display>
      <Body style={{ marginTop: 8 }}>That screen isn’t in the den.</Body>
      <View style={{ marginTop: 20, width: '100%' }}>
        <PawButton label="Back home" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
