import {
  View,
  TextInput,
  Pressable,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useSignIn, useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const loginFailCounter = 6;

export default function SignInScreen() {
  const signInCtx = useSignIn();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signIn = signInCtx?.signIn;
  const setActive = signInCtx?.setActive;
  const isLoaded = signInCtx?.isLoaded;

  const [step, setStep] = useState("idle");
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // if (step === "2fa") {
    //   router.push("/verify-2fa");
    // }

    if (step === "complete") {
      router.replace("/(tabs)");
    }
  }, [step]);

    useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn]);

  const onSignIn = async () => {
    if (!isLoaded || !signIn || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await signIn.create({
        identifier: email,
        password: password,
      });

      // if (res.status === "needs_second_factor") {
      //   const emailFactor = res.supportedSecondFactors?.find(
      //     (f) => f.strategy === "email_code"
      //   );

      //   if (!emailFactor) return;

      //   await signIn.prepareSecondFactor({
      //     strategy: "email_code",
      //     emailAddressId: emailFactor.emailAddressId,
      //   });

      //   setStep("2fa");
      //   return;
      // }

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
          `Login failed. Counter: ${loginFailCounter}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.topWave}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 236"
          preserveAspectRatio="none"
        >
          <Path
            d="M410.644 -168.367L7.28064 -148.081C7.28064 -148.081 -52.8418 420.383 21.8827 173.497C96.6071 -73.3895 327.35 192.708 425.246 153.211C523.142 113.714 410.644 -168.367 410.644 -168.367Z"
            fill="#C85A3A"
            fillOpacity={0.82}
          />
          <Path
            d="M389.47 -205.4L-13.8937 -185.115C-13.8937 -185.115 -74.0161 383.349 0.708378 136.463C75.4328 -110.423 306.175 155.674 404.072 116.177C501.968 76.6806 389.47 -205.4 389.47 -205.4Z"
            fill="#C85A3A"
          />
        </Svg>
      </View>

      <View style={styles.content}>
        <Image
          source={require("../../assets/DDlogo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9E9E9E"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9E9E9E"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          style={styles.input}
        />

        <Pressable
          style={[styles.logInBtn, loading && styles.disabledButton]}
          onPress={onSignIn}
          disabled={loading}
        >
          <Text style={styles.logIn}>
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </Pressable>

        <View style={styles.flexError}>
          <Text style={styles.gray}>Don’t have an account?</Text>

          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.bottomWave}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 236"
          preserveAspectRatio="none"
        >
          <Path
            d="M410.644 -168.367L7.28064 -148.081C7.28064 -148.081 -52.8418 420.383 21.8827 173.497C96.6071 -73.3895 327.35 192.708 425.246 153.211C523.142 113.714 410.644 -168.367 410.644 -168.367Z"
            fill="#C85A3A"
            fillOpacity={0.82}
          />
          <Path
            d="M389.47 -205.4L-13.8937 -185.115C-13.8937 -185.115 -74.0161 383.349 0.708378 136.463C75.4328 -110.423 306.175 155.674 404.072 116.177C501.968 76.6806 389.47 -205.4 389.47 -205.4Z"
            fill="#C85A3A"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAF7F4",
    overflow: "hidden",
  },

  topWave: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 145,
    zIndex: 1,
  },

  bottomWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 165,
    zIndex: 1,
    transform: [{ rotate: "180deg" }],
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 34,
    zIndex: 10,
  },

  logo: {
    width: 190,
    height: 72,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 6,
  },

  title: {
    color: "#C85A3A",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },

  subtitle: {
    color: "#C85A3A",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 34,
  },

  input: {
    height: 35,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DDD9",
    borderRadius: 7,
    paddingHorizontal: 12,
    color: "#333",
    fontSize: 12,
    marginBottom: 19,
  },

  logInBtn: {
    height: 36,
    backgroundColor: "#C85A3A",
    borderRadius: 8,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  logIn: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },

  flexError: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  gray: {
    color: "#8E8E8E",
    fontSize: 12,
  },

  signUpText: {
    color: "#C85A3A",
    fontWeight: "bold",
    fontSize: 12,
  },

  error: {
    color: "#C85A3A",
    textAlign: "center",
    marginTop: 14,
    fontSize: 12,
  },
});