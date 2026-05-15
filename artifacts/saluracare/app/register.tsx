import { router } from "expo-router";
import RegisterScreen from "@/screens/RegisterScreen";

export default function RegisterRoute() {
  return <RegisterScreen onGoToLogin={() => router.replace("/login")} />;
}
