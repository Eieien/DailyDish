import { 
  View, 
  TextInput, 
  Button,
  Text, 
  TouchableOpacity,
  StyleSheet, 
  Pressable,

} from "react-native";

import { useSignIn } from "@clerk/clerk-expo";
import { useState } from "react";
import { useRouter } from "expo-router";


export default function Verify2FA() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const onVerify = async () => {
    if (!signIn) return;
    try {
      const res = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (e) {
      setError("Invalid code");
    }
  };

  return (
    <View style={styles.background}>
      <Text style={[styles.white, {marginTop: 250,}]}>Enter the 6 digit code sent to your email.</Text>

      <View style={styles.inputBox}>
        <Text style={[styles.white, {alignSelf: "center", paddingEnd: 10,fontSize:17,}]}>Code:</Text>
        <TextInput
          placeholder="ex. 123456"
          placeholderTextColor={styles.white.color}
          onChangeText={setCode}
          keyboardType="number-pad"
          style={styles.input}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity onPress={onVerify}>
        <Text style={{ color: "white" }}>Resend code</Text>
      </TouchableOpacity >
      <Pressable   onPress={onVerify}>
        <Text style={styles.verify}>VERIFY</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    gap: 15,
    padding: 32,
    // justifyContent: "center", 
    backgroundColor: "#10082ce0",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 40,
    marginTop: 100,
    marginBottom: 1,
  },
  inputBox: {
    // flex: 1,
    borderWidth: 2,
    borderColor: "#e74545de",
    borderRadius: 30,
    // marginVertical: 15,
    display: "flex",
    flexDirection: "row",
    width: 330,
    paddingHorizontal: 20,
  },
  icon: {
    alignSelf: "center",
    paddingLeft: 15,
    paddingRight: 3,
    // backgroundColor: "#10082ce0",
  },
  input: {
    color: "#ffffffb2",
    height: 50,
    width: 280,
    fontSize: 20,
    // backgroundColor: "#10082ce0",
    
  },
  verify: {
    backgroundColor: "#e74545de",
    color: "#fff",
    alignSelf: "center",
    // marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 130, 
    fontWeight: "bold",
    fontSize: 15,
    borderRadius: 20,
  },
  signUp: {
    display: "flex", 
    flexDirection: "row", 
    alignSelf: "center",
    gap: 40,
    marginTop: 270,
  },
  white: {
    color: "#fff",
  },
  error: {
    color: "#fff",
    paddingBottom: 15,
    
  },
  flexError: {
    display: "flex",
    flexDirection: "row",
    gap: 45,
    alignSelf: "flex-end",
  }
})