import { Feather } from "@expo/vector-icons";

export interface Specialty {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  experience: number;
  rating: number;
  about: string;
}

export const SPECIALTIES: Specialty[] = [
  { id: "general-physician", name: "General Physician", icon: "user" },
  { id: "dermatology", name: "Dermatology", icon: "sun" },
  { id: "obstetrics-gynecology", name: "Obstetrics & Gynecology", icon: "heart" },
  { id: "orthopedics", name: "Orthopedics", icon: "activity" },
  { id: "ent", name: "ENT", icon: "headphones" },
  { id: "neurology", name: "Neurology", icon: "cpu" },
  { id: "cardiology", name: "Cardiology", icon: "heart" },
  { id: "urology", name: "Urology", icon: "shield" },
  { id: "gastroenterology", name: "Gastroenterology", icon: "thermometer" },
  { id: "psychiatry", name: "Psychiatry", icon: "smile" },
  { id: "pediatrics", name: "Pediatrics", icon: "users" },
  { id: "pulmonology", name: "Pulmonology", icon: "wind" },
  { id: "endocrinology", name: "Endocrinology", icon: "droplet" },
  { id: "nephrology", name: "Nephrology", icon: "filter" },
  { id: "neurosurgery", name: "Neurosurgery", icon: "tool" },
  { id: "rheumatology", name: "Rheumatology", icon: "zap" },
  { id: "ophthalmology", name: "Ophthalmology", icon: "eye" },
  { id: "dentist", name: "Dentist", icon: "smile" },
];

export const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr. Sarah Mitchell", qualification: "MBBS, MD", specialty: "General Physician", experience: 12, rating: 4.9, about: "Experienced in internal medicine and preventive care." },
  { id: "d2", name: "Dr. James Carter", qualification: "MBBS, DNB", specialty: "General Physician", experience: 8, rating: 4.7, about: "Specialist in chronic disease management." },
  { id: "d3", name: "Dr. Priya Sharma", qualification: "MBBS, MD Dermatology", specialty: "Dermatology", experience: 10, rating: 4.8, about: "Expert in cosmetic and clinical dermatology." },
  { id: "d4", name: "Dr. Anika Patel", qualification: "MBBS, MD", specialty: "Dermatology", experience: 6, rating: 4.6, about: "Specializes in skin allergies and laser treatments." },
  { id: "d5", name: "Dr. Meera Reddy", qualification: "MBBS, MS OB-GYN", specialty: "Obstetrics & Gynecology", experience: 15, rating: 4.9, about: "High-risk pregnancy and gynecological care specialist." },
  { id: "d6", name: "Dr. Fatima Khan", qualification: "MBBS, DGO", specialty: "Obstetrics & Gynecology", experience: 9, rating: 4.7, about: "Focuses on reproductive health and prenatal care." },
  { id: "d7", name: "Dr. Robert Chen", qualification: "MBBS, MS Ortho", specialty: "Orthopedics", experience: 14, rating: 4.8, about: "Joint replacement and sports medicine specialist." },
  { id: "d8", name: "Dr. David Park", qualification: "MBBS, DNB Ortho", specialty: "Orthopedics", experience: 7, rating: 4.5, about: "Expert in spinal disorders and fracture management." },
  { id: "d9", name: "Dr. Linda Nguyen", qualification: "MBBS, MS ENT", specialty: "ENT", experience: 11, rating: 4.7, about: "Specialist in sinus surgery and hearing disorders." },
  { id: "d10", name: "Dr. Alex Thompson", qualification: "MBBS, DM Neurology", specialty: "Neurology", experience: 16, rating: 4.9, about: "Expert in stroke, epilepsy, and movement disorders." },
  { id: "d11", name: "Dr. Raj Kapoor", qualification: "MBBS, DM Cardiology", specialty: "Cardiology", experience: 18, rating: 4.9, about: "Interventional cardiology and heart failure specialist." },
  { id: "d12", name: "Dr. Emily Watson", qualification: "MBBS, MD Cardiology", specialty: "Cardiology", experience: 10, rating: 4.8, about: "Focuses on preventive cardiology and echocardiography." },
  { id: "d13", name: "Dr. Suresh Iyer", qualification: "MBBS, MCh Urology", specialty: "Urology", experience: 13, rating: 4.7, about: "Robotic surgery and kidney stone specialist." },
  { id: "d14", name: "Dr. Maria Garcia", qualification: "MBBS, DM Gastro", specialty: "Gastroenterology", experience: 12, rating: 4.8, about: "Expert in liver diseases and endoscopy." },
  { id: "d15", name: "Dr. Kevin Brown", qualification: "MBBS, MD Psychiatry", specialty: "Psychiatry", experience: 9, rating: 4.6, about: "Specializes in anxiety, depression, and CBT therapy." },
  { id: "d16", name: "Dr. Sonia Das", qualification: "MBBS, MD Psychiatry", specialty: "Psychiatry", experience: 11, rating: 4.8, about: "Child and adolescent mental health specialist." },
  { id: "d17", name: "Dr. Arjun Mehta", qualification: "MBBS, MD Pediatrics", specialty: "Pediatrics", experience: 14, rating: 4.9, about: "Neonatal care and childhood disease specialist." },
  { id: "d18", name: "Dr. Lisa Chang", qualification: "MBBS, MD Pediatrics", specialty: "Pediatrics", experience: 8, rating: 4.7, about: "Expert in vaccination and developmental pediatrics." },
  { id: "d19", name: "Dr. Michael Ross", qualification: "MBBS, DM Pulmonology", specialty: "Pulmonology", experience: 15, rating: 4.8, about: "Asthma, COPD, and sleep disorders specialist." },
  { id: "d20", name: "Dr. Neeraj Gupta", qualification: "MBBS, DM Endocrinology", specialty: "Endocrinology", experience: 10, rating: 4.7, about: "Diabetes and thyroid disorder management expert." },
  { id: "d21", name: "Dr. Helen White", qualification: "MBBS, DM Nephrology", specialty: "Nephrology", experience: 13, rating: 4.8, about: "Dialysis and kidney transplant specialist." },
  { id: "d22", name: "Dr. Victor Lee", qualification: "MBBS, MCh Neurosurgery", specialty: "Neurosurgery", experience: 20, rating: 4.9, about: "Brain tumor and spinal cord surgery specialist." },
  { id: "d23", name: "Dr. Amanda Taylor", qualification: "MBBS, MD Rheumatology", specialty: "Rheumatology", experience: 9, rating: 4.6, about: "Arthritis and autoimmune disease specialist." },
  { id: "d24", name: "Dr. Ravi Kumar", qualification: "MBBS, MS Ophthalmology", specialty: "Ophthalmology", experience: 11, rating: 4.7, about: "Cataract surgery and retinal disease specialist." },
  { id: "d25", name: "Dr. Jessica Miller", qualification: "BDS, MDS", specialty: "Dentist", experience: 8, rating: 4.8, about: "Cosmetic dentistry and orthodontics expert." },
  { id: "d26", name: "Dr. Ankit Verma", qualification: "BDS, MDS Periodontics", specialty: "Dentist", experience: 6, rating: 4.5, about: "Specializes in gum care and dental implants." },
];

export function getDoctorsBySpecialty(specialty: string): Doctor[] {
  return DOCTORS.filter((d) => d.specialty === specialty);
}

export function getDoctorById(id: string): Doctor | undefined {
  return DOCTORS.find((d) => d.id === id);
}
