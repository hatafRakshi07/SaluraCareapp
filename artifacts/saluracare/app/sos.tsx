import { useNavigation } from "expo-router";
import SOSScreen from "@/screens/SOSScreen";

export default function SOSRoute() {
  const navigation = useNavigation() as any;
  return <SOSScreen navigation={navigation} />;
}
