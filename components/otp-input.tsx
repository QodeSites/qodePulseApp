import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  phoneNumber: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onSubmit: (number: string) => void;
  onEditNumber: () => void;
  onClose: () => void;
  resendOtp: (number: string) => void;
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
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [editNumberValue, setEditNumberValue] = useState(phoneNumber);
  const [timer, setTimer] = useState(300);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  /* ---------------- Keyboard handling ---------------- */
  useEffect(() => {
    const showSub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillChangeFrame", (e) => {
            const height =
              Dimensions.get("window").height -
              e.endCoordinates.screenY;
            setKeyboardHeight(Math.max(0, height));
          })
        : Keyboard.addListener("keyboardDidShow", (e) => {
            setKeyboardHeight(e.endCoordinates.height);
          });

    const hideSub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", () => {
            setKeyboardHeight(0);
          })
        : Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardHeight(0);
          });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* ---------------- Timer ---------------- */
  useEffect(() => {
    if (!visible) return;

    setTimer(300);
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, phoneNumber]);

  /* ---------------- Slide animation ---------------- */
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 300,
      duration: visible ? 250 : 200,
      useNativeDriver: true,
    }).start();
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
      onEditNumber();
    }
    setIsEditingNumber(false);
  };

  const handleResendOtp = () => {
    resendOtp(editNumberValue || phoneNumber);
    setTimer(300);
  };

  const handleSubmit = () => {
    onSubmit(editNumberValue || phoneNumber);
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View
            style={{
              transform: [
                { translateY: slideAnim },
                { translateY: -keyboardHeight },
              ],
            }}
            className="bg-white rounded-t-2xl px-5 pt-6 pb-8"
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

            {/* Phone number */}
            <View className="flex-row items-center mb-5">
              {isEditingNumber ? (
                <>
                  <TextInput
                    value={editNumberValue}
                    onChangeText={setEditNumberValue}
                    keyboardType="phone-pad"
                    className="flex-1 border border-blue-300 rounded-lg px-2 py-1 mr-2"
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={handleEditNumberSave}
                    style={{ marginRight: 8 }}
                  >
                    <Text className="text-blue-600 font-semibold">
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
              onChangeText={(v) => onOtpChange(v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="border border-gray-300 rounded-lg px-4 py-3 text-lg text-center tracking-widest mb-6"
            />

            {/* Timer */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500 text-sm font-mono">
                {timer > 0
                  ? `Resend available in ${formatMMSS(timer)}`
                  : "Didn't receive OTP?"}
              </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={timer > 0}
                style={{ opacity: timer > 0 ? 0.5 : 1 }}
              >
                <Text
                  className={`text-sm ${
                    timer > 0
                      ? "text-gray-400"
                      : "text-blue-600 font-semibold"
                  }`}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit */}
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
        </View>
      </View>
    </Modal>
  );
}
