'use client';

import Link from 'next/link';
import styles from './Sidebar.module.css';

const peptides = [
  "BPC-157", "TB-500", "Melanotan 2", "Ipamorelin", "CJC-1295",
  "Semaglutide", "Tirzepatide", "PT-141", "GHK-Cu", "Epitalon",
  "Frag 176-191", "CJC-1295 DAC", "Sermorelin", "Hexarelin"
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>Product List</h3>
      <ul className={styles.list}>
        {peptides.map((item) => (
          <li key={item} className={styles.listItem}>
            <Link href={`/product/${item.toLowerCase().replace(" ", "-")}`} className={styles.link}>
              {item}
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.promo}>
        <h4>USA Made</h4>
        <p>Highest Purity Guaranteed</p>
      </div>
    </aside>
  );
}
