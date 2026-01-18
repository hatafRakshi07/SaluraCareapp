# SaluraCare

## Overview
SaluraCare is a healthcare and emergency assistance mobile application built with React Native (Expo) and Express.js. It provides daily health tracking, medical supplies shopping, healthcare professional booking, and emergency SOS features.

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
- **Bottom Tab Navigator** (5 tabs):
  1. Coach - Daily health tracking (water intake, medicine reminders)
  2. For You - Personalized health recommendations
  3. Shop - Medical supplies e-commerce (SaluraMart)
  4. Reorder - Order history and medical reports
  5. Services - Book healthcare professionals

- **Global Features**:
  - Floating SOS button on all screens
  - Emergency modal for ambulance request

### Key Components
- `SOSButton` - Floating emergency button with pulse animation
- `HealthCard` - Gradient cards for health tracking
- `MedicineCard` - Medicine reminder cards with take action
- `ProductCard` - Shop product cards with add to cart
- `ServiceProviderCard` - Healthcare provider booking cards
- `OrderCard` - Order history with reorder functionality
- `ReportCard` - Medical reports with download/share

### Design System
- **Primary Color**: Teal (#00B5A5)
- **Secondary Color**: Navy Blue (#1A3A52)
- **Error/SOS Color**: Red (#E53935)
- **Card-based UI** with soft shadows
- **Light & Dark mode** support

## Recent Changes
- Initial app creation with all core screens
- Implemented 5-tab navigation structure
- Created reusable healthcare-focused components
- Added floating SOS button with emergency modal
- Generated app icon and empty state illustrations

## Development Notes
- The app uses AsyncStorage for local data persistence (MVP)
- All screens have proper safe area handling
- Empty states use generated illustrations
- Haptic feedback on key interactions
