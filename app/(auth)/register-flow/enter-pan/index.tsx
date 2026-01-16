import { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, Keyboard, Platform } from "react-native";
import { Button } from "@/components/ui/button";
import OtpBottomModal from "@/components/otp-input";
import { useRouter } from "expo-router";
import { Container } from "@/components/ui/container";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export default function PanInputScreen() {
  const [pan, setPan] = useState("");
  const [error, setError] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const inputRef = useRef<TextInput>(null);

  // This could be a phone pulled from context or prior steps, hardcoding for now.
  // In a real flow, replace this as needed.
  const phoneNumber = "+91 98765 43210";

  const handleChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setPan(formatted);

    if (formatted.length === 10 && !PAN_REGEX.test(formatted)) {
      setError("Invalid PAN number format");
    } else {
      setError("");
    }
  };

  // Now takes number as an input param
  const handleSubmit = (number: string) => {
    setOtp(""); // Reset OTP on new submit
    setOtpModalVisible(true);
    // Hide the PAN input keyboard (for more natural animation of modal up)
    Keyboard.dismiss();
    // Optionally do something with the PAN value or phone number here
  };

  const router = useRouter();

  const handleOtpSubmit = (submittedPhoneNumber: string) => {
    setOtpModalVisible(false);
    router.push("/(auth)/register-flow/final-step");
  };

  const handleResendOtp = (number: string) => {
    // Implement resend OTP logic here
  };

  const handleEditNumber = () => {
    // Optional: Implement edit number navigation here
  };

  const isValid = PAN_REGEX.test(pan);

  return (
    <Container
      className="bg-background px-5 pt-16"
      // Apply vertical alignment via contentContainerStyle
      // @ts-ignore
      contentContainerStyle={[styles.container]}
    >
      <Text style={styles.title}>
        Enter PAN Card Number
      </Text>

      <Text style={styles.subtitle}>
        PAN is required for identity verification
      </Text>

      {/* Input */}
      <TextInput
        ref={inputRef}
        value={pan}
        onChangeText={handleChange}
        placeholder="ABCDE1234F"
        autoCapitalize="characters"
        maxLength={10}
        keyboardType="default"
        style={[
          styles.input,
          error
            ? styles.inputError
            : pan.length === 10
            ? styles.inputSuccess
            : styles.inputDefault,
        ]}
        returnKeyType="done"
        blurOnSubmit={true}
        onSubmitEditing={() => {
          if (isValid) {
            handleSubmit(phoneNumber);
          }
        }}
      />

      {/* Error */}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {/* Helper */}
      <Text style={styles.helper}>
        Example: ABCDE1234F
      </Text>

      {/* Submit */}
      <View style={styles.buttonWrapper}>
        <Button
          onPress={() => handleSubmit(phoneNumber)}
          disabled={!isValid}
          className={`w-full ${!isValid ? "opacity-60" : ""}`}
        >
          Continue
        </Button>
      </View>

      {/* OTP Modal moves input above keyboard when open */}
      <OtpBottomModal
        visible={otpModalVisible}
        phoneNumber={phoneNumber}
        otp={otp}
        onOtpChange={setOtp}
        onSubmit={handleOtpSubmit}
        resendOtp={handleResendOtp}
        onEditNumber={handleEditNumber}
        onClose={() => setOtpModalVisible(false)}
        // No change needed: otp-input already uses KeyboardAvoidingView and ScrollView,
        // but Keyboard.dismiss() (above) ensures keyboard closes before modal opens.
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    letterSpacing: 4,
  },
  inputDefault: {
    borderColor: "#d1d5db",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  inputSuccess: {
    borderColor: "#22c55e",
  },
  error: {
    color: "#ef4444",
    marginTop: 8,
    fontSize: 14,
  },
  helper: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 8,
  },
  buttonWrapper: {
    marginTop: 32,
  },
});