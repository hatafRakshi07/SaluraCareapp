export interface LabTest {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: string;
  category: string;
  popular: boolean;
}

export const LAB_TESTS: LabTest[] = [
  {
    id: "1",
    name: "Complete Blood Count",
    price: 299,
    description: "Measures red blood cells, white blood cells, and platelets to assess overall health.",
    duration: "4-6 hours",
    category: "Blood",
    popular: true,
  },
  {
    id: "2",
    name: "Blood Sugar (Fasting)",
    price: 149,
    description: "Measures blood glucose levels to screen for diabetes or prediabetes.",
    duration: "2-4 hours",
    category: "Blood",
    popular: true,
  },
  {
    id: "3",
    name: "HbA1c (Glycated Haemoglobin)",
    price: 349,
    description: "Reflects average blood sugar over 2-3 months. Essential for diabetes management.",
    duration: "4-6 hours",
    category: "Blood",
    popular: false,
  },
  {
    id: "4",
    name: "Thyroid Panel (T3, T4, TSH)",
    price: 499,
    description: "Evaluates thyroid gland function to detect hypothyroidism or hyperthyroidism.",
    duration: "6-8 hours",
    category: "Thyroid",
    popular: true,
  },
  {
    id: "5",
    name: "Lipid Profile",
    price: 399,
    description: "Measures cholesterol and triglycerides to assess cardiovascular risk.",
    duration: "4-6 hours",
    category: "Blood",
    popular: true,
  },
  {
    id: "6",
    name: "Liver Function Test (LFT)",
    price: 449,
    description: "Assesses liver health by measuring enzymes, proteins, and bilirubin.",
    duration: "6-8 hours",
    category: "Organ Function",
    popular: false,
  },
  {
    id: "7",
    name: "Kidney Function Test (KFT)",
    price: 399,
    description: "Evaluates kidney health through creatinine, urea, and electrolyte levels.",
    duration: "6-8 hours",
    category: "Organ Function",
    popular: false,
  },
  {
    id: "8",
    name: "Urine Routine Analysis",
    price: 99,
    description: "Checks urine composition to detect infections, kidney issues, or diabetes.",
    duration: "2-4 hours",
    category: "Urine",
    popular: true,
  },
  {
    id: "9",
    name: "Vitamin D (25-OH)",
    price: 599,
    description: "Measures Vitamin D levels to detect deficiency affecting bones and immunity.",
    duration: "6-8 hours",
    category: "Vitamins",
    popular: true,
  },
  {
    id: "10",
    name: "Vitamin B12",
    price: 499,
    description: "Detects B12 deficiency which can cause anemia and neurological problems.",
    duration: "6-8 hours",
    category: "Vitamins",
    popular: false,
  },
  {
    id: "11",
    name: "Iron Studies (Serum Ferritin)",
    price: 349,
    description: "Evaluates iron levels to diagnose iron deficiency or iron overload conditions.",
    duration: "4-6 hours",
    category: "Blood",
    popular: false,
  },
  {
    id: "12",
    name: "C-Reactive Protein (CRP)",
    price: 299,
    description: "Detects inflammation in the body, used to monitor infections and autoimmune disease.",
    duration: "4-6 hours",
    category: "Inflammation",
    popular: false,
  },
];

export const TIME_SLOTS = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
  "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM",
];
