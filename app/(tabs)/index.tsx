import { Stack, Link, } from 'expo-router';

import { View, Pressable, Text, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';
import { useClerk } from "@clerk/clerk-expo";
import { useState } from "react";
import { router } from "expo-router";

export default function Home() {
  const { isSignedIn, signOut } = useClerk();

  if (!isSignedIn) {
    router.replace("/sign-in");
    return null;
  }

  return (
    <View className={styles.container}>
      {/* <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home">
          
        </ScreenContent> */}
        <Pressable onPress={() => {
                  signOut();
                  router.replace("/sign-in");
                }}
                style={des.logout}>
          <Text>
            Log Out
          </Text>
        </Pressable>
        {/* <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
          <Button title="Show Details" />
        </Link> */}

      {/* </Container> */}
    </View>
  );
}
const des = StyleSheet.create({
  logout:{
    marginTop: 100
  }
})

const styles = {
  container: 'flex flex-1 bg-white',
};


