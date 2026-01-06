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

                <div className={styles.actions}>
                    <Link href={`/product/${product.id}`} className={styles.learnMoreBtn}>
                        Learn More
                    </Link>
                    <button
                        className={styles.addBtn}
                        onClick={() => alert(`Added ${product.name} to cart!`)}
                    >
                        Add to Cart - ${product.price.toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    );
}
