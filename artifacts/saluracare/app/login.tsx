import { router } from "expo-router";
import LoginScreen from "@/screens/LoginScreen";

export default function LoginRoute() {
  return <LoginScreen onGoToRegister={() => router.replace("/register")} />;
}
