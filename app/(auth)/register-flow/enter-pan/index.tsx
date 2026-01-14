import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Button } from "@/components/ui/button";
import OtpBottomModal from "@/components/otp-input";
import { useRouter } from "expo-router";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export default function PanInputScreen() {
  const [pan, setPan] = useState("");
  const [error, setError] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState("");

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
    // Optionally do something with the PAN value or phone number here
  };

  // onSubmit now takes phoneNumber as input
  const router = useRouter();

  const handleOtpSubmit = (submittedPhoneNumber: string) => {
    setOtpModalVisible(false);
    router.push("/(auth)/register-flow/final-step");
  };

  // resendOtp callback, takes phone number as input
  const handleResendOtp = (number: string) => {
    // Implement resend OTP logic, for now just log
    // e.g., sendOtpToNumber(number);
    // You may also reset otp value if needed
    // For placeholder:
    // console.log("Resending OTP to:", number);
  };

  const handleEditNumber = () => {
    // If needed, allow go back to edit phone number, you can navigate or update state
  };

  const isValid = PAN_REGEX.test(pan);

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Enter PAN Card Number
      </Text>

      <Text className="text-base text-gray-600 mb-6">
        PAN is required for identity verification
      </Text>

      {/* Input */}
      <TextInput
        value={pan}
        onChangeText={handleChange}
        placeholder="ABCDE1234F"
        autoCapitalize="characters"
        maxLength={10}
        keyboardType="default"
        className={`border rounded-lg px-4 py-3 text-lg tracking-widest ${
          error
            ? "border-red-500"
            : pan.length === 10
            ? "border-green-500"
            : "border-gray-300"
        }`}
      />

      {/* Error */}
      {error ? (
        <Text className="text-red-500 mt-2 text-sm">{error}</Text>
      ) : null}

      {/* Helper */}
      <Text className="text-gray-500 text-sm mt-2">
        Example: ABCDE1234F
      </Text>

      {/* Submit */}
      <View className="mt-8">
        <Button
          onPress={() => handleSubmit(phoneNumber)}
          disabled={!isValid}
          className={`w-full ${!isValid ? "opacity-60" : ""}`}
        >
          Continue
        </Button>
      </View>

      {/* OTP Modal */}
      <OtpBottomModal
        visible={otpModalVisible}
        phoneNumber={phoneNumber}
        otp={otp}
        onOtpChange={setOtp}
        onSubmit={handleOtpSubmit}
        resendOtp={handleResendOtp}
        onEditNumber={handleEditNumber}
        onClose={() => setOtpModalVisible(false)}
      />
    </View>
  );
}
