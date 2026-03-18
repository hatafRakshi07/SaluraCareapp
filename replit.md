# SaluraCare

## Overview
SaluraCare is a healthcare and emergency assistance mobile application built with React Native (Expo) and Express.js. It provides daily health tracking, lab test booking, vaccination scheduling, healthcare professional booking, and emergency SOS features.

## Project Architecture

### Frontend (client/)
- **React Native with Expo** - Mobile app framework
- **React Navigation** - Tab and stack navigation
- **React Query** - Data fetching and caching
- **Reanimated** - Smooth animations

### Backend (server/)
- **Express.js** - API server
- **TypeScript** - Type safety

### Navigation Structure
- **Bottom Tab Navigator** (6 tabs):
  1. Home - Daily health tracking (water intake, medicine reminders)
  2. For You - Personalized health recommendations
  3. Lab Tests - Browse and book home sample collection lab tests
  4. Vaccination - Browse vaccines and schedule vaccination appointments
  5. Services - Book healthcare professionals (Home Nurse, Caretaker, Physiotherapist)
  6. Emergency - SOS ambulance request + emergency contacts with one-tap calling

- **Stack Screens** (outside tabs):
  - SOS - Legacy emergency modal (accessible for deep linking)

- **Global Features**:
  - Emergency tab with pulsing SOS button
  - One-tap emergency contact calling

### Key Components
- `SOSButton` - Floating emergency button (legacy, kept for modal use)
- `HealthCard` - Gradient cards for health tracking
- `MedicineCard` - Medicine reminder cards with take action
- `ServiceProviderCard` - Healthcare provider booking cards
- `SearchBar` - Reusable search input with filter button
- `CategoryChip` - Filter chip for category selection
- `EmptyState` - Empty state illustration component

### Data Libraries
- `client/lib/labTests.ts` - 12 lab tests with pricing, descriptions, time slots
- `client/lib/vaccines.ts` - 10 vaccines with recommended age, dose schedule

### Design System
- **Primary Color**: Teal (#00B5A5)
- **Secondary Color**: Navy Blue (#1A3A52)
- **Error/SOS Color**: Red (#E53935)
- **Card-based UI** with soft shadows
- **Light & Dark mode** support

## Recent Changes
- Initial app creation with all core screens
- Implemented 6-tab navigation structure: Home, For You, Lab Tests, Vaccination, Services, Emergency
- Removed: Shop, Reorder, Consult tabs; DoctorList screen; doctor/consultation data
- Added Lab Test Panel: 12 tests across 6 categories, search, home sample collection booking
- Added Vaccination Panel: 10 vaccines with dose scheduling, category filter, booking flow
- Added Emergency tab: animated SOS button, emergency contacts list, add/call/delete contacts
- Services: Home Nurse, Caretaker, Physiotherapist only
- Data stored in AsyncStorage / local state (MVP)

## Development Notes
- The app uses local state for data persistence (MVP)
- All screens have proper safe area handling with transparent tab bar
- Empty states and loading states handled throughout
- Haptic feedback on key interactions
- Animated press effects on all interactive cards
