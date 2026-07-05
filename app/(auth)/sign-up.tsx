import {
  View,
  TextInput,
  Button,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Feather as Icons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
// import { postUser } from "../lib/user";

export default function SignUpScreen() {
  const signUpCtx = useSignUp();
  const router = useRouter();

  const signUp = signUpCtx?.signUp;
  const setActive = signUpCtx?.setActive;
  const isLoaded = signUpCtx?.isLoaded;
  const [isChecked, setChecked] = useState(false);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);

  const onSignUp = async () => {
    if (!signUp || !isLoaded) return;

    setError("");

    try {
      const res = await signUp.create({
        emailAddress: email,
        password,
      });

      if (res.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        console.log("sending code");

        setPendingVerification(true);
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Sign up failed");
    }
  };

  const onVerify = async () => {
    if (!isLoaded || !signUp || isVerifying) return;

    setIsVerifying(true);

    try {
      const res = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (res.status === "complete") {
        if (setActive) {
          await setActive({ session: res.createdSessionId });
        }
        const userId = res.createdUserId || "";
        console.log("User ID:", userId);
        console.log("Username:", userName);
        console.log("Email:", email);
        // await postUser({
        //   id: userId,
        //   email: email.toLowerCase(),
        //   userName: userName,
        // });

        setPendingVerification(false);
        router.replace("/(tabs)");
      } else {
        setError("Verification not complete");
      }
    } catch (err: any) {
      console.log(err);
      setError(err?.errors?.[0]?.message || "Invalid code");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isLoaded || !signUp) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      {!pendingVerification ? (
        <>
          <Text style={styles.title}>Sign Up</Text>
          <View>
            <View style={styles.inputBox}>
              <Icons name="user" size={20} color="#fff" style={styles.icon} />
              <TextInput
                placeholder="Username"
                placeholderTextColor="white"
                onChangeText={setUserName}
                style={styles.input}
              />
            </View>
            <View style={styles.inputBox}>
              <Icons name="mail" size={20} color="#fff" style={styles.icon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="white"
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>
            <View style={styles.inputBox}>
              <Icons name="lock" size={20} color="#fff" style={styles.icon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="white"
                secureTextEntry
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.flexError}>
              <Checkbox
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? "#e74545de" : undefined}
              />
              <Pressable style={styles.flex}>
                <Text style={styles.white}> I Agree with</Text>
                <Text style={{ color: "#e74545de" }}>privacy</Text>
                <Text style={styles.white}>and</Text>
                <Text style={{ color: "#e74545de" }}>policy</Text>
              </Pressable>
            </View>

            <Pressable onPress={onSignUp}>
              <Text style={styles.signUp}>Sign Up</Text>
            </Pressable>
            {/* <Button title="Sign Up" onPress={onSignUp} /> */}
          </View>
          <View style={styles.logIn}>
            <Text style={styles.white}>Already have an account?</Text>
            <Pressable onPress={() => router.push("/sign-in")}>
              <Text style={[{ fontWeight: "bold", color: "#e74545de" }]}>
                Log In
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View>
          <Text style={[styles.white, { marginTop: 250 }]}>
            Enter the 6 digit code sent to your email.
          </Text>

          <View style={styles.inputBox}>
            <Text
              style={[
                styles.white,
                { alignSelf: "center", paddingEnd: 10, fontSize: 17 },
              ]}
            >
              Code:
            </Text>
            <TextInput
              placeholder="ex. 123456"
              placeholderTextColor={styles.white.color}
              onChangeText={setCode}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={onVerify}>
            <Text style={{ color: "white" }}>Resend code</Text>
          </Pressable>
          <Pressable onPress={onVerify}>
            <Text style={styles.signUp}>VERIFY</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    gap: 24,
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
    borderWidth: 2,
    borderColor: "#e74545de",
    borderRadius: 30,
    marginVertical: 15,
    display: "flex",
    flexDirection: "row",
    width: 330,
    paddingHorizontal: 15,
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
  signUp: {
    backgroundColor: "#e74545de",
    color: "#fff",
    alignSelf: "center",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 130,
    fontWeight: "bold",
    fontSize: 15,
    borderRadius: 20,
  },
  logIn: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignSelf: "center",
    gap: 40,
    marginTop: 180,
  },
  white: {
    color: "#fff",
  },
  error: {
    color: "#fff",
    // padding: 200,
  },
  flexError: {
    display: "flex",
    flexDirection: "row",
    gap: 3,
    marginLeft: 20,
    marginRight: 10,
    marginVertical: 5,
    marginBottom: 15,
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
  },
});
