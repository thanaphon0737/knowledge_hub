# 🚀 Advanced AI-Powered Knowledge Hub

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend (Gateway):** Node.js, Express.js, BullMQ
- **AI Engine:** Python, FastAPI, Celery
- **Databases:** PostgreSQL (for User/Doc data), ChromaDB (for Vectors)
- **Infrastructure:** Docker, Redis, MinIO (S3-compatible)

## ✅ To-Do List & Roadmap

### Phase 1: Setup & Foundations (Week 1)
- [x] Plan architecture and select Tech Stack
- [x] Set up Monorepo Git repository structure
- [ ] Set up Relational Database Schematic
- [ ] Configure `docker-compose.yml` for local development
- [ ] Create basic User Authentication API (Register/Login) in `main-backend`
- [ ] Create basic UI for Login/Register/Dashboard in `frontend`

### Phase 2: MVP Core Logic (Week 2)
- [ ] **(Backend)** Create API for file uploads and enqueueing jobs
- [ ] **(AI Service)** Create Worker to consume jobs, perform OCR, and create embeddings
- [ ] **(AI Service)** Store vector embeddings in ChromaDB
- [ ] **(Frontend)** Create UI for file uploads and status display
- [ ] **(Integration)** Implement end-to-end document upload flow

### Phase 3: RAG & Chat Interface (Week 3)
- [ ] **(AI Service)** Create API endpoint to handle questions and perform RAG
- [ ] **(Frontend)** Create Chat Interface for Q&A
- [ ] **(Backend)** Create gateway API for the chat flow
- [ ] **(Integration)** Implement end-to-end Q&A flow

### Phase 4: CI/CD & Polish (Week 4)
- [ ] Create Dockerfile for each service
- [ ] Set up CI/CD pipeline with GitHub Actions for demo deployment
- [ ] Write basic unit tests for critical parts
- [ ] Polish UI/UX and finalize README documentation
- [ ] **(Stretch Goal)** Add advanced RAG features (Hybrid Search, Re-ranking)
