# ConfirmIT (Legit) - Monorepo

**AI-powered, blockchain-anchored trust verification for African commerce**

🏆 **Hedera Africa Hackathon 2025** | Target: $150K in prizes

## 🎯 Project Overview

ConfirmIT tackles the ₦5 billion annual fraud problem in Nigeria by providing:
- **QuickScan**: AI-powered receipt verification in <8 seconds
- **Account Check**: Verify account trustworthiness before payment
- **Business Directory**: Verified business registry with trust scores
- **Hedera Integration**: Blockchain-anchored immutable proof

## 🏗️ Monorepo Structure

```
confirmit/
├── src/                    # Frontend (React + TypeScript + Vite)
├── backend/                # API Gateway (NestJS)
├── ai-service/             # AI Microservice (FastAPI)
├── docs/                   # Documentation
└── README.md               # This file
```

## 🚀 Quick Start

### Frontend (Lovable/React)
Already running in Lovable! Preview at your project URL.

### Backend (NestJS)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run start:dev
# Server runs at http://localhost:8080
# API docs at http://localhost:8080/api/docs
```

### AI Service (FastAPI)
```bash
cd ai-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload --port 8000
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

## 📚 Documentation

- [Backend README](./backend/README.md) - NestJS API Gateway setup
- [AI Service README](./ai-service/README.md) - FastAPI microservice setup
- [Frontend Guide](./docs/frontend-guide.md) - React app structure (coming soon)
- [Architecture](./docs/architecture.md) - System design (coming soon)

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Tailwind CSS, Zustand, React Query  
**Backend**: NestJS, Firebase, Cloudinary, Redis  
**AI**: FastAPI, Gemini Vision API, OpenCV, scikit-image  
**Blockchain**: Hedera Hashgraph (HCS + HTS)

## 📖 Phase 0 Complete! ✅

- ✅ Frontend foundation with routing and components
- ✅ NestJS backend structure with modules
- ✅ FastAPI AI service foundation
- ✅ Complete documentation and setup guides

## 🎯 Next: Phase 1 (Receipt Verification MVP)

Ready to implement the core receipt scanning feature!

---

**Built with ❤️ for Africa** | Hedera Africa Hackathon 2025
