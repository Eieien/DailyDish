import {
  View,
  TextInput,
  Button,
  Pressable,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather as Icons } from "@expo/vector-icons";
import { useSignIn, useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
// import { getUsers } from "../lib/user";

const loginFailCounter = 6;

export default function SignInScreen() {
  // const des = getUsers();
  // console.log(des)
  const signInCtx = useSignIn();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signIn = signInCtx?.signIn;
  const setActive = signInCtx?.setActive;
  const isLoaded = signInCtx?.isLoaded;

  const [step, setStep] = useState("idle");
  const [status, setStatus] = useState<any>();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (step === "2fa") {
      console.log(status);
      router.push("/verify-2fa")
      // router.push("/verify-2fa");
    }

    if (step === "complete") {
      router.replace("../index");
    }
  }, [step]);

  // useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("Skip to home page");
      return <Redirect href="/(tabs)" />;
    }
  // }, [isSignedIn]);

  const onSignIn = async () => {
    if (!isLoaded || !signIn || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await signIn.create({
        identifier: email,
        password: password,
      });

      if (res.status === "needs_second_factor") {
        const emailFactor = res.supportedSecondFactors?.find(
          (f) => f.strategy === "email_code",
        );

        if (!emailFactor) return;

        await signIn.prepareSecondFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
        setStep("2fa");
        setStatus(res.supportedSecondFactors);
        return;
      }

      if (res.status === "complete") {
        if (setActive) {
          await setActive({ session: res.createdSessionId });
        }
        setStep("complete");
        return;
      }

      setError("Unexpected status: " + res.status);
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.message ||
          `fucking Login fail counter: ${loginFailCounter}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <Text style={styles.title}>Log In</Text>
      <View>
        <View style={styles.inputBox}>
          <Icons name="user" size={20} color="#fff" style={styles.icon} />
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
        <View style={styles.flexError}>
          <Text style={styles.white}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text style={[{ fontWeight: "bold", color: "#e74545de" }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
        <Pressable style={styles.logInBtn} onPress={onSignIn}>
          <Text style={styles.logIn}>Log In</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    gap: 24,
    padding: 32,
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
  },
  logInBtn: {
    backgroundColor: "#e74545de",
    marginTop: 20,
    borderRadius: 20,
    paddingVertical: 6,
  },
  logIn: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
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
    justifyContent: "flex-start",
    gap: 6,
  },
});
