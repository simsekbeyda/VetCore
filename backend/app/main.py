from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.routers import auth, admin, vet, owner, chatbot

# Tabloları oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VetCore API",
    version="1.0.0",
    description="Veteriner hekimler için ilaç bilgi ve karar destek sistemi",
)

@app.on_event("startup")
async def startup_event():
    try:
        from app.rag.indexer import get_collection
        get_collection()
        print("ChromaDB koleksiyonu yüklendi.")
    except Exception as e:
        print(f"ChromaDB yüklenemedi: {e}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(vet.router, prefix="/api/v1")
app.include_router(owner.router, prefix="/api/v1")
app.include_router(chatbot.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "VetCore API çalışıyor."}


@app.get("/health")
def health():
    return {"status": "ok"}
