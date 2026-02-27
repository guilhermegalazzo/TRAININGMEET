# 🚀 TrainingMeet - Social Training Calendar

TrainingMeet is a high-performance social platform for athletes and enthusiasts to organize and discover training sessions. Built with a focus on speed, real-time engagement, and stunning aesthetics.

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Real-time**: Socket.IO
- **Production**: Docker, Multi-stage builds, Rate Limiting, Compression

### Mobile
- **Core**: React Native + Expo
- **Router**: Expo Router (File-based)
- **State**: Zustand + React Query
- **Maps**: Mapbox SDK
- **Design**: Custom "Neon" Design System

---

## 🚦 Getting Started

### 1. Backend Setup

1. Go to `apps/api`:
   ```bash
   cd apps/api
   ```
2. Create your `.env` based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Run the development server:
   ```bash
   pnpm install
   pnpm run dev
   ```
4. **Health Check**: Visit `http://localhost:3000/health` to verify status.

### 2. Mobile Setup

1. Go to `apps/mobile`:
   ```bash
   cd apps/mobile
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start Expo:
   ```bash
   npx expo start
   ```

---

## 🐳 Production Deployment (Docker)

To run the API in a production-ready container:
```bash
docker build -t training-meet-api -f apps/api/Dockerfile .
docker run -p 3000:3000 --env-file .env training-meet-api
```

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk private API key |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `MAPBOX_ACCESS_TOKEN` | Token for Mapbox services |
| `FIREBASE_SERVICE_ACCOUNT` | JSON string for FCM (Push) |

---

## 📱 Features
- **Smart Calendar**: Manage your training schedule with RRULE support.
- **Map Explore**: Find trainings nearby using Mapbox.
- **Live Location**: Real-time athlete tracking during sessions.
- **Push Notifications**: FCM alerts for invites and starting sessions.
- **Social**: Friend requests, in-app chat, and group training.

---
Built with ❤️ by TrainingMeet Team.
