# ShipFlow Mobile App

React Native (Expo) mobile application for the ShipFlow shipping management system.

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android) — OR Android Studio / Xcode for simulators

## Setup

```bash
cd "shipping system/shipping_mobile"
npm install
```

## Configure API URL

Copy `.env.example` to `.env` and update the API URL to point to your backend:

```
EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:8002/graphql/
```

> **Important:** When testing on a physical device, use your computer's local IP address (e.g. `192.168.1.100`), not `localhost`. On Android emulator use `10.0.2.2`.

## Run

```bash
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan the QR code with Expo Go on your phone

## Features

| Screen | Description |
|---|---|
| Login | JWT authentication, session persistence |
| Dashboard | KPI cards, quick actions, recent shipments |
| Shipments | Full list with search + status filters |
| Shipment Detail | Full info, status timeline, advance status |
| Create Shipment | 3-step wizard: parties → package → review |
| Tracking | Public tracking by tracking number |
| Dispatch | Create manifests, select drivers/vehicles/shipments |
| Drivers & Vehicles | Manage fleet, add new |
| Warehouses | Capacity tracking, add warehouses |
| Branches | View and add branches |
| Customers | Revenue analytics per customer |
| Finance | Summary, invoices, payments |
| Users/Team | Add employees with role-based permissions |
| Profile | Account info, company details, logout |

## Architecture

- **State:** Zustand (`src/store/useStore.ts`)
- **Data Fetching:** React Query (`src/hooks/useData.ts`)
- **API:** Raw GraphQL via `fetch` (`src/api/client.ts`)
- **Navigation:** React Navigation v6 (bottom tabs + stack)
- **Auth:** JWT stored in AsyncStorage; auto-restored on app launch
