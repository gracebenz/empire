import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Cinzel_400Regular, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Cinzel_400Regular, Cinzel_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
