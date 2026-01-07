import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

async function getProducts(): Promise<Product[] | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (typeof window === 'undefined') {
        if (!baseUrl) {
            return null;
        }
    }

    const finalUrl = baseUrl ? `${baseUrl}/products` : '/api/products';

    try {
        const res = await fetch(finalUrl, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

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
    }
];

export default async function ShopPage() {
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
            </div>
            <div className={styles.grid}>
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}
