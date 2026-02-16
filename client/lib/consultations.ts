import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Consultation {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  consultationType: string;
  date: string;
  timeSlot: string;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

const STORAGE_KEY = "@saluracare_consultations";

export async function getConsultations(): Promise<Consultation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to load consultations:", error);
    return [];
  }
}

export async function addConsultation(
  consultation: Omit<Consultation, "id" | "status" | "createdAt">
): Promise<Consultation> {
  const existing = await getConsultations();
  const newConsultation: Consultation = {
    ...consultation,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const updated = [newConsultation, ...existing];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newConsultation;
}

export async function cancelConsultation(id: string): Promise<void> {
  const existing = await getConsultations();
  const updated = existing.map((c) =>
    c.id === id ? { ...c, status: "cancelled" as const } : c
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
