from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form, APIRouter
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import shutil
import os

app = FastAPI(title="Peptide Sciences Clone API")
api_router = APIRouter()

# ... (Models and Database remain same, just using router below) ...

# Mount static files for images
app.mount("/api/static", StaticFiles(directory="static"), name="static_api")
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mock Database ---
PRODUCTS = [
    {
        "id": 1,
        "name": "BPC-157",
        "price": 55.00,
        "size": "5mg",
        "description": "BPC-157 is a pentadecapeptide composed of 15 amino acids. It is a partial sequence of body protection compound (BPC) that is discovered in and isolated from human gastric juice. Experimentally it has been demonstrated to accelerate the healing of many different wounds, including tendon-to-bone healing and superior healing of damaged ligaments.",
        "image_url": "/placeholder-peptide.jpg", 
        "category": "Peptides",
        "sku": "260-005-CP",
        "cas_number": "137525-51-0",
        "formula": "C62H98N16O22",
        "molecular_weight": "1419.5 g/mol",
        "purity": "99% HPLC",
        "pubchem_cid": "9943215",
        "synonyms": "Bepecin, PL 14736, PL 10",
        "sequence": "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val"
    },
    {
        "id": 2,
        "name": "TB-500",
        "price": 60.00,
        "size": "5mg",
        "description": "TB-500 is a synthetic fraction of the protein thymosin beta-4. It is present in virtually all human and animal cells. The main purpose of this peptide is to promote healing. The effects of TB-500 have been linked to an increase in red blood cell count, angiogenesis, and collagen deposition.",
        "image_url": "/placeholder-peptide.jpg",
        "category": "Peptides",
        "sku": "330-006-TB",
        "cas_number": "77591-33-4",
        "formula": "C212H350N56O78S",
        "molecular_weight": "4963.5 g/mol",
        "purity": "99% HPLC",
         "pubchem_cid": "16132341",
        "synonyms": "Thymosin Beta 4",
        "sequence": "Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser"
    },
    {
        "id": 3,
        "name": "Melanotan 2",
        "price": 45.00,
        "size": "10mg",
        "description": "Melanotan II is a synthetic analogue of the hormone alpha-melanocyte stimulating hormone (α-MSH). It was originally developed as a potential treatment for female sexual dysfunction and erectile dysfunction, but is now primarily known for its ability to stimulate melanogenesis.",
        "image_url": "/placeholder-peptide.jpg",
        "category": "Peptides",
        "sku": "110-002-MT",
        "cas_number": "121062-08-6",
        "formula": "C50H69N15O9",
        "molecular_weight": "1024.18 g/mol",
        "purity": "99% HPLC",
        "pubchem_cid": "92432",
        "synonyms": "MT-2, MT-II",
        "sequence": "Ac-Nle-Asp-His-D-Phe-Arg-Trp-Lys-NH2"
    },
    {
        "id": 4,
        "name": "Ipamorelin",
        "price": 35.00,
        "size": "2mg",
        "description": "Ipamorelin is a growth hormone secretagogue (GHS) and an analog of the hormone Ghrelin. It selectively binds to the ghrelin receptor to stimulate the release of growth hormone.",
        "image_url": "/placeholder-peptide.jpg",
        "category": "Peptides",
        "sku": "PEP-IPA-2MG",
        "cas_number": "170851-70-4",
        "formula": "C38H49N9O5",
        "molecular_weight": "711.85 g/mol",
        "purity": "99% HPLC",
        "pubchem_cid": "9809473",
        "synonyms": "Ipamorelin Acetate",
        "sequence": "Aib-His-D-2-Nal-D-Phe-Lys-NH2"
    },
    {
        "id": 5,
        "name": "CJC-1295",
        "price": 43.00,
        "size": "2mg",
        "description": "CJC-1295 is a tetra-substituted peptide analog of GHRH1–29. It allows for a more sustained release of growth hormone without increasing prolactin or cortisol levels.",
        "image_url": "/placeholder-peptide.jpg",
        "category": "Peptides",
        "sku": "PEP-CJC-2MG",
        "cas_number": "863288-34-0",
        "formula": "C152H252N44O42",
        "molecular_weight": "3367.97 g/mol",
        "purity": "99% HPLC",
        "pubchem_cid": "N/A",
        "synonyms": "CJC-1295 No DAC",
        "sequence": "Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Sark-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2"
    },
    {
        "id": 6,
        "name": "Semaglutide",
        "price": 115.00,
        "size": "3mg",
        "description": "Semaglutide is a GLP-1 receptor agonist primarily used for weight management and blood sugar control. It mimics the action of the human incretin glucagon-like peptide-1 (GLP-1).",
        "image_url": "/placeholder-peptide.jpg",
        "category": "Peptides",
        "sku": "PEP-SEMA-3MG",
        "cas_number": "910463-68-2",
        "formula": "C187H291N45O59",
        "molecular_weight": "4113.58 g/mol",
        "purity": "99% HPLC",
        "pubchem_cid": "56843331",
        "synonyms": "Ozempic generic",
        "sequence": "His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys(AEEAc-AEEAc-gamma-Glu-17-carboxyheptadecanoyl)-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly"
    },
    {
        "id": 7,
        "name": "5-Amino-1MQ",
        "price": 255.00,
        "size": "50mg (60 Capsules)",
        "description": "5-amino-1MQ is a small-molecule research compound that functions as a selective nicotinamide N-methyltransferase (NNMT) inhibitor. In preclinical metabolic models, it enhances NAD+ salvage pathway flux, leading to improved energy homeostasis and sirtuin activation. 5-Amino-1MQ is used to investigate epigenetic and redox control mechanisms associated with cellular metabolism and aging.",
        "image_url": "/placeholder-peptide.jpg", 
        "category": "Peptides",
        "sku": "260-005-CP",
        "cas_number": "42464-96-0",
        "formula": "C10H11N2",
        "molecular_weight": "159.21 g/mol",
        "purity": "99% HPLC",
        "pubchem_cid": "N/A",
        "synonyms": "5-Amino-1-methylquinolinium",
        "sequence": "N/A"
    },

]

USERS_DB = {
    "user@example.com": "password", 
    "admin@example.com": "admin123"
}

# --- Models ---
class Product(BaseModel):
    id: int
    name: str
    price: float
    size: str
    description: str
    image_url: str
    category: str
    sku: Optional[str] = None
    cas_number: Optional[str] = None
    formula: Optional[str] = None
    molecular_weight: Optional[str] = None
    purity: Optional[str] = None
    pubchem_cid: Optional[str] = None
    synonyms: Optional[str] = None
    sequence: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserParam(BaseModel):
    email: str
    token: str

class CartItem(BaseModel):
    product_id: int
    quantity: int

# --- Routes ---

@api_router.get("/")
def read_root():
    return {"message": "Peptide Sciences Clone API is running"}

@api_router.get("/products", response_model=List[Product])
def get_products():
    return PRODUCTS

@api_router.post("/products", response_model=Product)
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    size: str = Form(...),
    description: str = Form(...),
    category: str = Form("Peptides"),
    sku: Optional[str] = Form(None),
    cas_number: Optional[str] = Form(None),
    formula: Optional[str] = Form(None),
    purity: Optional[str] = Form("99% HPLC"),
    image: UploadFile = File(None)
):
    # Generare new ID
    new_id = len(PRODUCTS) + 1
    
    image_url = "/placeholder-peptide.jpg" # Default
    
    if image:
        # Save the uploaded file
        file_location = f"static/images/{image.filename}"
        os.makedirs(os.path.dirname(file_location), exist_ok=True)
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(image.file, file_object)
        
        # Use a relative path /api/static/... so it works both locally and on Vercel
        image_url = f"/api/{file_location}"

    new_product = {
        "id": new_id,
        "name": name,
        "price": price,
        "size": size,
        "description": description,
        "image_url": image_url,
        "category": category,
        "sku": sku,
        "cas_number": cas_number,
        "formula": formula,
        "purity": purity
    }
    
    PRODUCTS.append(new_product)
    return new_product

@api_router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for p in PRODUCTS:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")

@api_router.post("/login")
def login(creds: LoginRequest):
    # Mock Auth
    if creds.email in USERS_DB and USERS_DB[creds.email] == creds.password:
        return {"token": "fake-jwt-token-123", "email": creds.email}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Include the router twice to handle both prefixed and non-prefixed requests
app.include_router(api_router, prefix="/api")
app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)
