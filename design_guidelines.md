# SaluraCare Design Guidelines

## Brand Identity
**Purpose**: Emergency-first healthcare assistant providing daily health tracking, medical supplies, professional services, and instant SOS access.

**Aesthetic Direction**: Medical-grade minimal with calming professionalism. Clean card-based layouts, soft gradients, and trustworthy teal/navy palette. Fast, one-hand operation prioritizing emergency readiness.

**Memorable Element**: Floating SOS button accessible from every screen - the app's life-saving anchor point.

---

## Navigation Architecture

**Root Navigation**: Bottom Tab Bar (5 tabs)
- Coach (Daily Health tracking)
- For You (Personalized recommendations)
- Shop (SaluraMart e-commerce)
- Reorder (Order history & medical reports)
- Services (Book healthcare professionals)

**Global Elements**:
- Floating SOS button (fixed bottom-right, above all screens)
- Profile icon (top-right header)

**Auth Flow**: OTP-based login (Firebase Auth) → Onboarding (emergency contacts, health profile) → Main App

---

## Screen-by-Screen Specifications

### 1. Coach (Daily Health)
**Purpose**: Track daily habits, medicines, water intake, and rewards

**Layout**:
- Header: Greeting text + profile icon (right), transparent background
- Scrollable content with cards
- Safe area: top = headerHeight + 16px, bottom = tabBarHeight + 16px

**Components**:
- Toggle switch: "Daily Task" / "Your Coach"
- Reward progress card (gradient background, rounded corners)
- Drink Water card: Goal display + "Done" button
- Medicine Reminder cards: List of medicines with dosage, time, individual "Done" buttons
- Progress indicators (1/3, 2/3 format)

**Empty State**: When no tasks, show "All caught up!" illustration

---

### 2. Shop (SaluraMart)
**Purpose**: Medical supplies e-commerce with buy/rent options

**Layout**:
- Header: Search bar ("Search Medical Supplies"), transparent
- Horizontal scrolling category chips (Masks, Gloves, Syringes, Dressing)
- Grid of product cards (2 columns)
- Safe area: top = headerHeight + 16px, bottom = tabBarHeight + 16px

**Components**:
- Product cards: Image, name, quantity, price, "Add to Cart" button
- Cart icon (header right) with badge count
- Rent toggle (Daily/Weekly/Monthly) on applicable products

**Empty State**: "No items in this category" with medical supplies illustration

---

### 3. Services
**Purpose**: Book healthcare professionals for home/clinic visits

**Layout**:
- Header: Search bar + filter icon, transparent
- Scrollable list of service provider cards
- Safe area: top = headerHeight + 16px, bottom = tabBarHeight + 16px

**Components**:
- Provider cards: Profile image (circular), name, role, years of experience, availability indicator (green dot), "Book" button
- Service types: Home Nurse, Caretaker, Physiotherapist (with specializations)
- Filter modal: Service type, availability, rating

**Empty State**: "No providers available" with healthcare worker illustration

---

### 4. Reorder (History & Reports)
**Purpose**: View order history and manage medical reports

**Layout**:
- Header: Toggle between "Orders" / "Reports", transparent
- Scrollable list
- Safe area: top = headerHeight + 16px, bottom = tabBarHeight + 16px

**Components**:
- Order cards: Product thumbnail, date, status, "Reorder" button
- Report cards: PDF icon, test name, date, "Download" + "Share" buttons
- Upload button (floating, bottom-right, above SOS)

**Empty State**: "No orders yet" / "No reports uploaded" with clipboard illustration

---

### 5. For You (Recommendations)
**Purpose**: Personalized health content and product suggestions

**Layout**:
- Header: "For You" title, transparent
- Scrollable feed of recommendation cards
- Safe area: top = headerHeight + 16px, bottom = tabBarHeight + 16px

**Components**:
- Content cards: Image, headline, short description, CTA
- Product suggestion cards (similar to Shop layout)

---

### SOS Modal (Global)
**Purpose**: Emergency ambulance request

**Layout**: Full-screen modal with map

**Components**:
- Live map showing user location + nearby hospitals
- "Request Ambulance" button (large, red, pulsing animation)
- Emergency contacts list with one-tap call
- Live tracking view (when ambulance en route)

---

## Color Palette

**Primary**: 
- Teal: `#00B5A5`
- Navy Blue: `#1A3A52`

**Gradients**:
- Card gradient: Teal to light teal (`#00B5A5` to `#7FD9D1`)
- Background gradient (subtle): White to light gray (`#FFFFFF` to `#F5F7FA`)

**Semantic**:
- Success: `#4CAF50`
- Warning: `#FF9800`
- Error/SOS: `#E53935`
- Availability indicator: `#4CAF50`

**Surfaces**:
- Card background: `#FFFFFF`
- Screen background: `#F5F7FA`

**Text**:
- Primary: `#1A1A1A`
- Secondary: `#757575`
- On-primary: `#FFFFFF`

**Dark Mode**:
- Background: `#121212`
- Surface: `#1E1E1E`
- Text primary: `#FFFFFF`
- Text secondary: `#B0B0B0`

---

## Typography

**Font**: System default (San Francisco for iOS, Roboto for Android)

**Type Scale**:
- Header Large: 28px Bold
- Header: 22px Bold
- Title: 18px Semibold
- Body: 16px Regular
- Caption: 14px Regular
- Label: 12px Medium

---

## Visual Design

**Cards**: 
- Border radius: 16px
- Soft drop shadow: offset (0, 2), opacity 0.08, radius 8
- Padding: 16px

**Buttons**:
- Primary: Teal background, white text, 12px radius
- Secondary: White background, teal border, teal text
- Pressed state: 90% opacity

**Floating SOS Button**:
- Red circular button (`#E53935`)
- Drop shadow: offset (0, 4), opacity 0.20, radius 8
- Position: bottom-right, 16px from edges, above tab bar
- Icon: Feather "alert-circle"

**Icons**: Feather icon set from @expo/vector-icons

---

## Assets to Generate

1. **icon.png** - App icon: Medical cross with teal gradient background
2. **splash-icon.png** - SaluraCare logo with heartbeat line
3. **empty-tasks.png** - Checkmark with celebration confetti (Coach screen, no tasks)
4. **empty-shop.png** - Medical supplies on shelf (Shop screen, no items)
5. **empty-services.png** - Healthcare worker waving (Services screen, no providers)
6. **empty-orders.png** - Empty clipboard with pencil (Reorder screen, no orders)
7. **empty-reports.png** - Folder with medical cross (Reports tab, no reports)
8. **onboarding-health.png** - Stethoscope and heart (Onboarding screen 1)
9. **onboarding-emergency.png** - Ambulance illustration (Onboarding screen 2)
10. **user-avatar-default.png** - Circular avatar placeholder (Profile)

All illustrations: Minimalist line-art style, teal/navy color scheme, medical theme.