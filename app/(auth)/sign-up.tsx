import {
  View,
  TextInput,
  Pressable,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
import { postUsers } from "../_lib/user";
import Svg, { Path } from "react-native-svg";

const loginFailCounter = 6;

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
        console.log("pass:", password);

        await postUsers({
          id: userId,
          name: userName,
        });

        setPendingVerification(false);
        router.replace("/diet-goal");

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
      <View style={styles.background}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

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
        <View nativeID="clerk-captcha" />

        <Text style={styles.step}>Step 1 of 2</Text>

        <Image
          source={require("../../assets/DDlogo.png")}
          style={styles.logo}
        />

        {!pendingVerification ? (
          <>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Let's get you started!</Text>

            <TextInput
              placeholder="Username"
              placeholderTextColor="#9E9E9E"
              onChangeText={setUserName}
              value={userName}
              style={styles.input}
            />

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

            <View style={styles.termsRow}>
              <Checkbox
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? "#C85A3A" : undefined}
              />

              <Pressable style={styles.termsTextRow}>
                <Text style={styles.gray}>I agree with </Text>
                <Text style={styles.linkText}>Privacy </Text>
                <Text style={styles.gray}>and </Text>
                <Text style={styles.linkText}>Policy</Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.button} onPress={onSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>

            <View style={styles.bottomRow}>
              <Text style={styles.gray}>Already have an account?</Text>

              <TouchableOpacity onPress={() => router.push("/sign-in")}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>
              Enter the 6 digit code sent to your email
            </Text>

            <TextInput
              placeholder="ex. 123456"
              placeholderTextColor="#9E9E9E"
              onChangeText={setCode}
              value={code}
              keyboardType="number-pad"
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable onPress={onVerify}>
              <Text style={styles.resendText}>Resend code</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={onVerify}>
              <Text style={styles.buttonText}>
                {isVerifying ? "Verifying..." : "Verify"}
              </Text>
            </Pressable>
          </>
        )}
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
    height: 135,
    zIndex: 1,
  },

  bottomWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 145,
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
    marginBottom: 30,
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
    marginBottom: 17,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  termsTextRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },

  button: {
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

  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  gray: {
    color: "#8E8E8E",
    fontSize: 12,
  },

  linkText: {
    color: "#C85A3A",
    fontWeight: "bold",
    fontSize: 12,
  },

  resendText: {
    color: "#C85A3A",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 18,
  },

  error: {
    color: "#C85A3A",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 12,
  },

  step: {
  position: "absolute",
  top: 120,
  right: 30,
  backgroundColor: "#F7DCD3",
  color: "#C85A3A",
  fontWeight: "700",
  fontSize: 12,
  paddingHorizontal: 15,
  paddingVertical: 7,
  borderRadius: 18,
  zIndex: 10,
  },
});