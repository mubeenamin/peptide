import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getProducts(): Promise<Product[] | null> {
    try {
        const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });
        if (!res.ok) {
            // Fallback or throw
            console.warn("Backend not reachable or returned error");
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        return null;
    }
}

// Fallback data if backend is not running yet
const MOCK_PRODUCTS: Product[] = [
    {
        "id": 1,
        "name": "BPC-157",
        "price": 55.00,
        "size": "5mg",
        "description": "BPC-157 is a pentadecapeptide.",
        "image_url": "/placeholder.jpg",
        "category": "Peptides"
    },
    {
        "id": 2,
        "name": "TB-500",
        "price": 60.00,
        "size": "5mg",
        "description": "TB-500 is a synthetic fraction of thymosin beta-4.",
        "image_url": "/placeholder.jpg",
        "category": "Peptides"
    },
    {
        "id": 3,
        "name": "Melanotan 2",
        "price": 45.00,
        "size": "10mg",
        "description": "Melanotan II is a synthetic analogue.",
        "image_url": "/placeholder.jpg",
        "category": "Peptides"
    },
    {
        "id": 4,
        "name": "Ipamorelin",
        "price": 35.00,
        "size": "2mg",
        "description": "Ipamorelin is a growth hormone secretagogue.",
        "image_url": "/placeholder.jpg",
        "category": "Peptides"
    },
    {
        "id": 5,
        "name": "CJC-1295",
        "price": 43.00,
        "size": "2mg",
        "description": "CJC-1295 No DAC.",
        "image_url": "/placeholder.jpg",
        "category": "Peptides"
    },
    {
        "id": 6,
        "name": "Semaglutide",
        "price": 115.00,
        "size": "3mg",
        "description": "GLP-1 Agonist.",
        "image_url": "/placeholder.jpg",
        "category": "Peptides"
    }
];

export default async function ShopHome() {
    let products = await getProducts();

    if (!products) {
        products = MOCK_PRODUCTS;
    }

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>All Peptides</h1>
                    <p className={styles.subtitle}>Highest Purity US-Made Research Peptides</p>
                </div>
                <div>
                    {/* Dropdown for sort could go here */}
                </div>
            </div>
            <div className={styles.grid}>
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}
