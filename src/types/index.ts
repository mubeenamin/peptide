export interface Product {
    id: number;
    name: string;
    price: number;
    size: string;
    description: string;
    image_url: string;
    category?: string;
    sku?: string;
    cas_number?: string;
    formula?: string;
    molecular_weight?: string;
    purity?: string;
    pubchem_cid?: string;
    synonyms?: string;
    sequence?: string;
}
