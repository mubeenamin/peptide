'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { Product } from '@/types';

export default function ProductPage() {
    const params = useParams();
    const id = params?.id;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);


    // Mock data for fallback
    const MOCK_PRODUCTS: Product[] = [
        {
            id: 1,
            name: 'BPC-157',
            sku: 'PEP-BPC157-5MG',
            size: '5mg',
            price: 45.00,
            image_url: 'placeholder',
            description: 'BPC-157 is a peptide chain composed of 15 amino acids. It is considered a fragment of the protein BPC (Body Protection Compound).',
            cas_number: '137525-51-0',
            molecular_weight: '1419.5',
            formula: 'C62H98N16O22',
            purity: '99% HPLC',
            sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Kp-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
            category: 'Peptide Capsules'
        },
        {
            id: 2,
            name: 'TB-500',
            sku: 'PEP-TB500-5MG',
            size: '5mg',
            price: 55.00,
            image_url: 'placeholder',
            description: 'TB-500 is a synthetic fraction of the protein thymosin beta-4, which is present in virtually all cells of human and animal bodies.',
            cas_number: '75591-33-4',
            molecular_weight: '4963.5',
            formula: 'C212H350N56O78S',
            purity: '99% HPLC',
            sequence: 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
            category: 'Peptide Capsules'
        }
    ];

    useEffect(() => {
        if (!id) return;

        const findProduct = (products: Product[]) => {
            return products.find(p => {
                // Exact ID match
                if (String(p.id) === id) return true;

                // Slug match (handle lower/upper and spaces)
                const slug = p.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
                const searchId = (id as string).toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

                return slug === searchId;
            });
        };

        setLoading(true);
        fetch('/api/products')
            .then(res => {
                if (!res.ok) throw new Error('Backend not reachable');
                return res.json();
            })
            .then((data: Product[]) => {
                const found = findProduct(data);
                if (found) {
                    setProduct(found);
                } else {
                    console.warn('Product not found in API, checking mock...');
                    // Try mock if not found in API (e.g. if API has limited data)
                    const mockFound = findProduct(MOCK_PRODUCTS);
                    setProduct(mockFound || MOCK_PRODUCTS[0]); // Fallback to first mock for demo
                }
                setLoading(false);
            })
            .catch(err => {
                console.warn('Backend fetch failed, using mock data:', err);
                const found = findProduct(MOCK_PRODUCTS);
                setProduct(found || MOCK_PRODUCTS[0]);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading...</div>;
    if (!product) return <div className="container" style={{ padding: '50px' }}>Product not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.warning}>
                <span className={styles.warningIcon}>!</span>
                <div>
                    <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Product Usage:</span> This PRODUCT IS INTENDED AS A RESEARCH CHEMICAL ONLY. This designation allows the use of research chemicals strictly for in vitro testing and laboratory experimentation only. All product information available on this website is for educational purposes only. Bodily introduction of any kind into humans or animals is strictly forbidden by law. This product should only be handled by licensed, qualified professionals. This product is not a drug, food, or cosmetic and may not be misbranded, misused or mislabeled as a drug, food or cosmetic.
                </div>
            </div>

            <div className={styles.productLayout}>
                {/* LEFT COLUMN: Image & Chem Info */}
                <div className={styles.leftCol}>
                    <div className={styles.imageCard}>
                        <div className={styles.refInfo}>
                            <span className={styles.sku}>REF</span> {product.sku || 'N/A'}
                            <span className={styles.capsules}>{product.size}</span>
                        </div>

                        <div className={styles.imagePlaceholder}>
                            {product.image_url && !product.image_url.includes('placeholder') ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
                                />
                            ) : (
                                <span style={{ fontSize: '8rem' }}>💊</span>
                            )}
                        </div>

                        <div className={styles.chemInfo}>
                            <div className={styles.chemRow}>
                                <span className={styles.chemLabel}>CAS #:</span> {product.cas_number || 'N/A'}
                            </div>
                            <div className={styles.chemRow}>
                                <span className={styles.chemLabel}>Formula:</span> {product.formula || 'N/A'}
                            </div>
                            <div className={styles.chemRow}>
                                <span className={styles.chemLabel}>M.W.:</span> {product.molecular_weight || 'N/A'}
                            </div>
                        </div>

                        <div className={styles.badges}>
                            <div className={styles.badge}>PURITY</div> {product.purity || '99% HPLC'}
                            <div>
                                <div className={styles.badge}>RUO</div>
                                <span className={styles.researchText}> Research use only. Not for human or veterinary use.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN: Details */}
                <div className={styles.mainInfo}>
                    <h1 className={styles.title}>
                        {product.name}
                        <span className={styles.freeShipping}>FREE Shipping</span>
                    </h1>

                    <div className={styles.description}>
                        <p>{product.description}</p>
                    </div>

                    {product.sequence && (
                        <div className={styles.sequenceBox}>
                            <strong style={{ display: 'block', marginBottom: '10px' }}>Sequence:</strong>
                            <p style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {product.sequence}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Action */}
                <div className={styles.actionsCard}>
                    <div className={styles.price}>${product.price.toFixed(2)}</div>

                    <div className={styles.qtyBox}>
                        <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                        <input className={styles.qtyInput} type="text" value={quantity} readOnly />
                        <button className={styles.qtyBtn} onClick={() => setQuantity(q => q + 1)}>+</button>
                    </div>

                    <button className={styles.addToCart} onClick={() => alert(`Added ${quantity} x ${product.name} to cart`)}>
                        Add to Cart
                    </button>

                    <div className={styles.bulkTable}>
                        <div className={styles.bulkRow}>
                            <span>Buy 5 and save 4%</span>
                            <span className={styles.bulkPrice}>${(product.price * 0.96).toFixed(2)} each</span>
                        </div>
                        <div className={styles.bulkRow}>
                            <span>Buy 10 and save 8%</span>
                            <span className={styles.bulkPrice}>${(product.price * 0.92).toFixed(2)} each</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
