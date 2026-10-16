# 🌱 Chennai AgroSmart AI
> **Grow Better. Waste Less.**
> Multi-Agent AI Agricultural Decision Support Platform for Farmers in Chennai and Tamil Nadu.

---

## 🌾 Project Overview

**Chennai AgroSmart AI** is a complete, production-grade **MERN Stack + Multi-Agent AI** agricultural decision-support web application. It empowers farmers to make high-confidence field decisions by synthesizing insights from four specialized AI intelligence agents:

1. **🌱 Crop Intelligence Agent** — Identifies foliar pathogens, early concentric lesions, and chlorosis using computer-vision models (EfficientNet-B0 / MobileNetV3 / OpenCV).
2. **🌦️ Weather Intelligence Agent** — Fetches live Tamil Nadu regional coordinates (via Open-Meteo live telemetry) to calculate irrigation risk and micro-climate disease incubation windows.
3. **🪨 Soil Intelligence Agent** — Evaluates soil profile suitability (Red Soil, Sandy, Clay, Loamy), root-zone moisture saturation, drainage risks, and pH nutrient availability.
4. **📈 Market Intelligence Agent** — Tracks wholesale spot prices and trends at the Koyambedu Wholesale Market, Chennai, providing selling timing recommendations.

Outputs from all four agents are synthesized by the **AgroSmart Decision Engine** to formulate one straightforward, jargon-free recommendation and prioritized task checklist for the farmer.

---

## 🏛️ System Architecture

```text
                            React Frontend (Vite + Tailwind CSS)
                                              ↓
                               Express.js REST API + Middleware
                                              ↓
                                   Multi-Agent Orchestrator
                                              ↓
                ┌──────────────────┬──────────────────┬──────────────────┐
                ↓                  ↓                  ↓                  ↓
          🌱 Crop Agent     🌦️ Weather Agent    🪨 Soil Agent      📈 Market Agent
          (Image / Vision)     (Live Meteo)       (Tilth & pH)       (Koyambedu Mandi)
                └──────────────────┼──────────────────┴──────────────────┘
                                   ↓
                       AgroSmart Decision Engine
                                   ↓
                   MongoDB Database (Mongoose Models)
                                   ↓
                    Farmer Actionable Advisory Card
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Deep agricultural emerald, earthy beige, soft lime accents)
- **Routing**: React Router DOM (with protected route guards)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Koyambedu 5-day mandi price trends)
- **HTTP Client**: Axios with JWT bearer interceptors

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing
- **File Ingestion**: Multer with 10MB limit & JPG/PNG/WEBP strict MIME validation
- **Security**: Helmet, CORS, express-validator, parameterized queries

### Multi-Agent Layer
- **Orchestrator**: `agentOrchestrator.js` using `Promise.allSettled()` for fault-isolated parallel agent execution.
- **Decision Engine**: `decisionEngine.js` for multi-factor correlation and human-readable farmer advice synthesis.
- **Weather Telemetry**: Live Open-Meteo API integration with calibrated fallback.

---

## 📂 Project Structure

```text
chennai-agrosmart-ai/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── AgentCard.jsx
│   │   │   ├── AgentStatus.jsx
│   │   │   ├── WeatherCard.jsx
│   │   │   ├── SoilCard.jsx
│   │   │   ├── MarketCard.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FarmSetup.jsx
│   │   │   ├── UploadCrop.jsx
│   │   │   ├── Recommendation.jsx
│   │   │   ├── History.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── farmController.js
│   │   ├── analysisController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Farm.js
│   │   ├── CropAnalysis.js
│   │   ├── AgentResult.js
│   │   └── FinalRecommendation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── farmRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── profileRoutes.js
│   │   └── agentRoutes.js
│   ├── services/
│   │   ├── agentOrchestrator.js
│   │   ├── cropAgent.js
│   │   ├── weatherAgent.js
│   │   ├── soilAgent.js
│   │   ├── marketAgent.js
│   │   ├── decisionEngine.js
│   │   ├── weatherService.js
│   │   └── plantHealthService.js
│   ├── uploads/
│   ├── app.js
│   ├── server.js
│   ├── test-db.js
│   ├── .env.example
│   ├── .env
│   └── package.json
└── README.md
```

---

## 🗄️ MongoDB Database Setup

The backend connects directly to your existing MongoDB database using Mongoose.

### 1. Configure Connection String
Open `server/.env` and supply your connection URI:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chennai_agrosmart?retryWrites=true&w=majority
```
*(Or your local MongoDB instance: `mongodb://localhost:27017/chennai_agrosmart`)*

> [!IMPORTANT]
> The application strictly connects to your designated MongoDB URI without mocking or ephemeral databases. If the connection fails, the server fails gracefully with clear diagnostic messages.

### 2. Verify Database Connection
To test your MongoDB connection string independently, run:
```bash
cd server
node test-db.js
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`):
```env
PORT=5000
MONGODB_URI=YOUR_EXISTING_MONGODB_URI
JWT_SECRET=YOUR_JWT_SECRET_KEY_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional External ML/FastAPI Microservice:
ML_SERVICE_URL=

# Optional Agmarknet/Mandi API:
MARKET_API_URL=
MARKET_API_KEY=
```

### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Running

### 1. Clone & Set Active Directory
Open your terminal in `C:\Users\USER\.gemini\antigravity\scratch\chennai-agrosmart-ai`.

### 2. Start the Backend Server
```bash
cd server
npm install
npm run dev
# Or: node server.js
```
The backend initializes on port `5000` after verifying the MongoDB connection.

### 3. Start the Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
The React Vite app will launch at `http://localhost:5173`.

---

## 🌐 API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Create farmer account
- `POST /api/auth/login` — Sign in & receive JWT token
- `GET  /api/auth/me` — Retrieve active profile (Protected)

### Farms & Land Setup
- `POST /api/farms` — Register a farm profile (Protected)
- `GET  /api/farms` — List farms owned by authenticated user (Protected)
- `GET  /api/farms/:id` — Retrieve specific farm details (Protected)
- `PUT  /api/farms/:id` — Update farm details (Protected)

### Crop Analysis & Multi-Agent Pipeline
- `POST /api/analysis` — Upload photo (`cropPhoto`) and execute 4-agent pipeline (Protected)
- `GET  /api/analysis` — Retrieve authenticated user's analysis history (Protected)
- `GET  /api/analysis/:id` — Retrieve comprehensive 4-agent report & decision engine output (Protected)
- `GET  /api/recommendations/:analysisId` — Retrieve final recommendation details (Protected)

### Profile & Settings
- `GET /api/profile` — Get profile and farming preferences (Protected)
- `PUT /api/profile` — Update phone, preferred language, default crop (Protected)

---

## 🤖 Transparent AI Mode Indicators

To maintain rigorous transparency, every agent explicitly displays its operational mode:

| Agent | Source | Mode Label |
|---|---|---|
| **🌱 Crop Agent** | External CV microservice / Gemini Vision / Calibrated botanical rules | `LIVE MODEL PREDICTION` or `DEMO MODE` |
| **🌦️ Weather Agent** | Live Open-Meteo Chennai Coordinates (13.0827° N, 80.2707° E) | `LIVE WEATHER` or `DEMO WEATHER MODE` |
| **🪨 Soil Agent** | Soil telemetry sensors & physical tilth rules | `REAL SENSOR DATA` or `DEMO SOIL MODE` |
| **📈 Market Agent** | Agmarknet Mandi API / Koyambedu benchmark trends | `LIVE MANDI FEED` or `DEMO MARKET MODE` |

---

## 🧠 Decision Engine Rationale: "Why are we recommending this?"

The AgroSmart Decision Engine does not output raw, unexplained numbers. It calculates multi-factor interactions:

```text
High Ambient Humidity (78%)
          +
High Soil Moisture (68%)
          ↓
Heightened Fungal Spore Risk
          ↓
Action: Reduce / Pause Irrigation
          ↓
Action: Inspect Lower Leaf Canopy for Early Blight
```

---

## 🔒 Security Implementations

- **Password Hashing**: Salted bcrypt hashing with 10 rounds.
- **Route Authorization**: Protected routes reject unauthorized requests with HTTP 401.
- **Multi-Tenant User Isolation**: Users can query only their own farms, analyses, and recommendations.
- **Strict File Uploads**: Multer validates file extensions (`.jpg`, `.jpeg`, `.png`, `.webp`) and enforces a 10MB limit.
- **HTTP Hardening**: Helmet security headers configured with cross-origin policies for static upload serving.

---

## 👨‍🌾 Designed for Farmers

Built with deep respect for agricultural communities:
- High contrast, legible typography (`Plus Jakarta Sans`)
- Intuitive drag-and-drop & mobile camera photo intake
- Multilingual readiness (English, தமிழ், తెలుగు, हिन्दी)
- Clear, step-by-step checklist format without technical jargon
