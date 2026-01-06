'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        size: '',
        category: 'Peptides',
        sku: '',
        cas_number: '',
        formula: '',
        purity: '99% HPLC',
        description: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('price', formData.price);
            data.append('size', formData.size);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('purity', formData.purity);

            if (formData.sku) data.append('sku', formData.sku);
            if (formData.cas_number) data.append('cas_number', formData.cas_number);
            if (formData.formula) data.append('formula', formData.formula);

            if (imageFile) {
                data.append('image', imageFile);
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/products`, {
                method: 'POST',
                body: data,
            });

            if (!res.ok) {
                throw new Error('Failed to create product');
            }

            const newProduct = await res.json();
            toast.success(`Product "${newProduct.name}" created successfully!`);

            // Reset form
            setFormData({
                name: '',
                price: '',
                size: '',
                category: 'Peptides',
                sku: '',
                cas_number: '',
                formula: '',
                purity: '99% HPLC',
                description: ''
            });
            setImageFile(null);

            // Redirect to home/shop to show the product
            setTimeout(() => {
                router.push('/');
            }, 1500);

        } catch (err) {
            console.error(err);
            toast.error('Error creating product. Check console.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Add New Product</h2>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Product Name</label>
                        <input name="name" className={styles.input} placeholder="e.g. BPC-157" onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Price ($)</label>
                        <input name="price" type="number" step="0.01" className={styles.input} placeholder="55.00" onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Size/Quantity</label>
                        <input name="size" className={styles.input} placeholder="e.g. 5mg" onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>SKU</label>
                        <input name="sku" className={styles.input} placeholder="e.g. 260-005-CP" onChange={handleChange} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>CAS Number</label>
                        <input name="cas_number" className={styles.input} placeholder="e.g. 137525-51-0" onChange={handleChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Formula</label>
                        <input name="formula" className={styles.input} placeholder="e.g. C62H98N16O22" onChange={handleChange} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Purity</label>
                        <input name="purity" className={styles.input} defaultValue="99% HPLC" onChange={handleChange} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Product Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className={styles.input}
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Description</label>
                        <textarea name="description" className={styles.textarea} placeholder="Product detailed description..." onChange={handleChange} required />
                    </div>

                    <button type="submit" className={styles.submitBtn}>Add Product</button>
                </form>
            </div>
        </div>
    );
}
