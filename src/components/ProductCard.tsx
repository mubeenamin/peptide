'use client';

import styles from './ProductCard.module.css';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className={styles.card}>
            <Link href={`/product/${product.id}`} className={styles.imageWrapper}>
                {product.image_url && !product.image_url.includes('placeholder') ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                ) : (
                    <div className={styles.placeholderImage}>⚗️</div>
                )}
            </Link>
            <div className={styles.details}>
                <Link href={`/product/${product.id}`} className={styles.name}>
                    {product.name}
                </Link>
                <div className={styles.category}>{product.category}</div>
                <div className={styles.price}>${product.price.toFixed(2)}</div>

                <div className={styles.actions}>
                    <button
                        className={styles.addBtn}
                        onClick={() => alert(`Added ${product.name} to cart!`)}
                    >
                        Add to Cart
                    </button>
                    <Link href={`/product/${product.id}`} className={styles.learnMoreBtn}>
                        Full Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
