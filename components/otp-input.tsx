import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Pencil } from "lucide-react-native";
import { Button } from "@/components/ui/button";

type Props = {
  visible: boolean;
  phoneNumber: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onSubmit: (number: string) => void;
  onEditNumber: () => void;
  onClose: () => void;
  resendOtp: (number: string) => void; // Now takes number as input
};

function formatMMSS(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function OtpBottomModal({
  visible,
  phoneNumber,
  otp,
  onOtpChange,
  onSubmit,
  onEditNumber,
  onClose,
  resendOtp,
}: Props) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  // For handling edit mode (editing phone number in-place)
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [editNumberValue, setEditNumberValue] = useState(phoneNumber);

  // Timer state for OTP resend (5 minutes = 300 seconds)
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (visible) {
      setTimer(300); // Reset timer on modal visible
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, phoneNumber]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (visible && timer > 0) {
      interval = setInterval(() => setTimer((sec) => (sec > 0 ? sec - 1 : 0)), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, timer]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setIsEditingNumber(false);
      setEditNumberValue(phoneNumber);
    }
  }, [visible, phoneNumber]);

  const handleEditNumberSave = () => {
    if (
      editNumberValue &&
      editNumberValue.trim() !== "" &&
      editNumberValue !== phoneNumber
    ) {
      // Pass new phone number up to parent via callback
      onEditNumber?.();
    }
    setIsEditingNumber(false);
  };

  const handleResendOtp = () => {
    resendOtp?.(editNumberValue || phoneNumber);
    setTimer(300);
  };

  const handleSubmit = () => {
    onSubmit?.(editNumberValue || phoneNumber);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Animated.View
            className="bg-white rounded-t-2xl px-5 pt-6 pb-8"
            style={{
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Verify OTP
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-gray-500 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Phone number (editable) */}
            <View className="flex-row items-center mb-5">
              {isEditingNumber ? (
                <>
                  <TextInput
                    value={editNumberValue}
                    onChangeText={setEditNumberValue}
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                    className="flex-1 border border-blue-300 rounded-lg px-2 py-1 text-base mr-2"
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={handleEditNumberSave}
                    style={{ marginRight: 8 }}
                  >
                    <Text className="text-blue-600 text-base font-semibold">
                      Save
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditingNumber(false);
                      setEditNumberValue(phoneNumber);
                    }}
                  >
                    <Text className="text-gray-400 text-lg">✕</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text className="text-base text-gray-700 mr-2">
                    {phoneNumber}
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditingNumber(true)}>
                    <Pencil size={16} color="#2563eb" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* OTP input */}
            <TextInput
              value={otp}
              onChangeText={(val) =>
                onOtpChange(val.replace(/[^0-9]/g, ""))
              }
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="border border-gray-300 rounded-lg px-4 py-3 text-lg text-center tracking-widest mb-6"
              editable={!isEditingNumber}
            />

            {/* Timer & Resend OTP */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-500 text-sm font-mono">
                {timer > 0
                  ? `Resend available in ${formatMMSS(timer)}`
                  : "Didn't receive OTP?"}
              </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={timer > 0}
                style={[
                  { opacity: timer > 0 ? 0.6 : 1, marginLeft: 8 },
                ]}
              >
                <Text
                  className={`${
                    timer > 0
                      ? "text-gray-400"
                      : "text-blue-600 font-semibold"
                  } text-sm`}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit button */}
            <Button
              onPress={handleSubmit}
              disabled={otp.length < 6 || isEditingNumber}
              className={`w-full ${
                otp.length < 6 || isEditingNumber ? "opacity-60" : ""
              }`}
            >
              Submit
            </Button>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
