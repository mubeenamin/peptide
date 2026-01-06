'use client';

import Link from 'next/link';

export default function CartPage() {
    // Mock cart items
    const cartItems = [
        { id: 1, name: "BPC-157", size: "5mg", price: 55.00, quantity: 1 }
    ];

    return (
        <div>
            <h1>Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Product</th>
                            <th style={{ padding: '10px' }}>Price</th>
                            <th style={{ padding: '10px' }}>Qty</th>
                            <th style={{ padding: '10px' }}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>
                                    <strong>{item.name}</strong><br />
                                    <small>{item.size}</small>
                                </td>
                                <td style={{ padding: '10px' }}>${item.price.toFixed(2)}</td>
                                <td style={{ padding: '10px' }}>{item.quantity}</td>
                                <td style={{ padding: '10px' }}>${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <Link href="/checkout" className="btn">Proceed to Checkout</Link>
            </div>
        </div>
    );
}
