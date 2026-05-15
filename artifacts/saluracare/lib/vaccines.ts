export interface Vaccine {
  id: string;
  name: string;
  recommendedAge: string;
  description: string;
  doses: number;
  intervalWeeks: number;
  category: string;
  color: string;
}

export interface VaccinationRecord {
  id: string;
  vaccineId: string;
  vaccineName: string;
  doseNumber: number;
  date: string;
  time: string;
  location: string;
  status: "scheduled" | "completed" | "missed";
}

export const VACCINES: Vaccine[] = [
  {
    id: "1",
    name: "Covid-19 (mRNA)",
    recommendedAge: "12 years and above",
    description: "Protects against COVID-19 infection and severe illness. Booster doses recommended annually.",
    doses: 2,
    intervalWeeks: 4,
    category: "Viral",
    color: "#4CAF50",
  },
  {
    id: "2",
    name: "Influenza (Flu)",
    recommendedAge: "6 months and above",
    description: "Annual flu vaccine protecting against seasonal influenza strains. Highly recommended for elderly and immunocompromised.",
    doses: 1,
    intervalWeeks: 52,
    category: "Viral",
    color: "#2196F3",
  },
  {
    id: "3",
    name: "Hepatitis A",
    recommendedAge: "1 year and above",
    description: "Prevents Hepatitis A liver infection spread through contaminated food and water.",
    doses: 2,
    intervalWeeks: 24,
    category: "Liver",
    color: "#FF9800",
  },
  {
    id: "4",
    name: "Hepatitis B",
    recommendedAge: "All ages (newborns primarily)",
    description: "Protects against Hepatitis B virus causing chronic liver disease and liver cancer.",
    doses: 3,
    intervalWeeks: 4,
    category: "Liver",
    color: "#FF5722",
  },
  {
    id: "5",
    name: "Tetanus & Diphtheria (Td)",
    recommendedAge: "All ages (booster every 10 years)",
    description: "Combined booster vaccine protecting against tetanus and diphtheria. Essential after wounds.",
    doses: 1,
    intervalWeeks: 520,
    category: "Bacterial",
    color: "#9C27B0",
  },
  {
    id: "6",
    name: "MMR (Measles, Mumps, Rubella)",
    recommendedAge: "12–15 months (first dose)",
    description: "Triple vaccine preventing measles, mumps, and rubella — highly contagious viral diseases.",
    doses: 2,
    intervalWeeks: 4,
    category: "Viral",
    color: "#E91E63",
  },
  {
    id: "7",
    name: "Typhoid",
    recommendedAge: "2 years and above",
    description: "Protects against typhoid fever caused by Salmonella typhi. Recommended before travel to endemic areas.",
    doses: 1,
    intervalWeeks: 156,
    category: "Bacterial",
    color: "#795548",
  },
  {
    id: "8",
    name: "Varicella (Chickenpox)",
    recommendedAge: "12–15 months (first dose)",
    description: "Prevents chickenpox and reduces the risk of shingles in later life.",
    doses: 2,
    intervalWeeks: 12,
    category: "Viral",
    color: "#00BCD4",
  },
  {
    id: "9",
    name: "HPV (Human Papillomavirus)",
    recommendedAge: "9–26 years",
    description: "Prevents HPV infections that can lead to cervical, throat, and other cancers.",
    doses: 2,
    intervalWeeks: 26,
    category: "Viral",
    color: "#F06292",
  },
  {
    id: "10",
    name: "Pneumococcal (PCV)",
    recommendedAge: "Infants and adults 65+",
    description: "Protects against pneumococcal bacteria causing pneumonia, meningitis, and bloodstream infections.",
    doses: 1,
    intervalWeeks: 260,
    category: "Bacterial",
    color: "#607D8B",
  },
];

export const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];
