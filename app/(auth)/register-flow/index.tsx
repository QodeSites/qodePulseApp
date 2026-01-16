import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Checklist options
const CHECKLIST_OPTIONS = [
  { id: "name", label: "Full Name" },
  { id: "email", label: "Email Address" },
  { id: "phone", label: "Phone Number" },
  { id: "location", label: "Location" },
  { id: "dob", label: "Date of Birth" },
  { id: "profile_photo", label: "Profile Photo" },
];

export default function DataChecklistScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const toggleItem = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Container className="bg-background px-5 pt-14 flex-1">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 12,
          flexGrow: 1,
        }}
      >
        <Text className="text-2xl font-bold mb-2 text-gray-900">
          Select Data to Collect
        </Text>
        <Text className="text-base mb-6 text-gray-600">
          Choose what information you want to collect from users
        </Text>
        <View>
          {CHECKLIST_OPTIONS.map((item) => {
            const isChecked = selected.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                }}
                onPress={() => toggleItem(item.id)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    marginRight: 16,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: isChecked ? "#3b82f6" : "#94a3b8",
                    backgroundColor: isChecked ? "#3b82f6" : "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {isChecked && <Check size={18} color="#fff" />}
                </View>
                <Text style={{ fontSize: 16, color: "#111827" }}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="mt-8">
          <Button
            onPress={() =>
              router.push({
                pathname: "/(auth)/register-flow/enter-pan",
                // params: { selectedFields: JSON.stringify(selected) }
              })
            }
            disabled={selected.length === 0}
            variant={selected.length === 0 ? "default" : "primary"}
            className={`w-full ${selected.length === 0 ? "opacity-60" : ""}`}
          >
            Next
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}