"""Katalog nama produk berdasarkan SKU (FR-4 & seed narrative).

Memetakan SKU ke nama produk ramah pengguna untuk auto-discovery
produk dari riwayat transaksi order_lines.
"""
from __future__ import annotations

KNOWN_SKU_NAMES: dict[str, str] = {
    "SRM-NIA10": "Serum Niacinamide 10%",
    "SUN-SPF50": "Sunscreen SPF 50",
    "RAK-ORG3T": "Rak Organizer 3 Tingkat",
    "PWRBNK-10K": "Powerbank 10.000 mAh",
    "PWRBNK-10K-HTM": "Powerbank 10.000 mAh (Hitam)",
    "PWRBNK-10K-PTH": "Powerbank 10.000 mAh (Putih)",
    "HOODIE-BSC": "Hoodie Basic",
    "HOODIE-BSC-HTM-L": "Hoodie Basic (Hitam L)",
    "HOODIE-BSC-ABU-XL": "Hoodie Basic (Abu XL)",
    "HOODIE-BSC-MRN-M": "Hoodie Basic (Maroon M)",
    "TUMB-1L": "Tumbler 1L",
    "TUMB-1L-SGE": "Tumbler 1L (Sage)",
    "TUMB-1L-CRM": "Tumbler 1L (Cream)",
    "TUMB-1L-HTM": "Tumbler 1L (Hitam)",
    "TWS-53": "Earphone TWS 5.3",
    "TWS-53-PTH": "Earphone TWS 5.3 (Putih)",
    "TWS-53-HTM": "Earphone TWS 5.3 (Hitam)",
    "MUG-CRM": "Mug Keramik",
    "MUG-CRM-SGE": "Mug Keramik (Sage)",
    "MUG-CRM-PTH": "Mug Keramik (Putih)",
    "LAMP-TCH": "Lampu Meja Sentuh",
    "LAMP-TCH-RGB": "Lampu Meja Sentuh RGB",
    "LAMP-TCH-WRM": "Lampu Meja Sentuh Warm",
    "TOTE-CNV": "Tote Bag Kanvas",
    "TOTE-CNV-HTM": "Tote Bag Kanvas (Hitam)",
    "TOTE-CNV-NAT": "Tote Bag Kanvas (Natural)",
    "CASE-IP15PM": "Casing iPhone 15 Pro Max",
    "CASE-IP15PM-HTM": "Casing iPhone 15 Pro Max (Hitam)",
    "CASE-IP15PM-NVY": "Casing iPhone 15 Pro Max (Navy)",
    "CASE-IP15PM-PNK": "Casing iPhone 15 Pro Max (Pink)",
    "MINYAK-2L": "Minyak Goreng 2L",
    "BERAS-5KG": "Beras 5kg",
    "GULA-1KG": "Gula Pasir 1kg",
    "GALON-ISI": "Galon Air Isi Ulang",
    "KOPI-KAPAL": "Kopi Kapal Api",
    "SARIWANGI-50": "Teh Sariwangi 50s",
    "KAOS-OVR": "Kaos Oversize",
    "KAOS-OVR-HTM-M": "Kaos Oversize (Hitam M)",
    "KAOS-OVR-HTM-L": "Kaos Oversize (Hitam L)",
    "KAOS-OVR-PTH-L": "Kaos Oversize (Putih L)",
    "KAOS-OVR-NVY-M": "Kaos Oversize (Navy M)",
    "KOP-GUL-250": "Kopi Gula Aren 250ml",
    "TEH-MEL-1L": "Teh Melati Botol 1L",
    "SBL-KRG-100": "Sambal Koreng 100g",
    "MKI-AYM-85": "Mie Keriting Ayam 85g",
    "KER-TAH-40": "Keripik Tahu Pedas 40g",
    "MAD-HTN-500": "Madu Hutan 500g",
    "BRN-SKG-01": "Beras Singkong 1kg",
    "SNK-RJM-05": "Snack Rumput Laut (pak 5)",
    "KAL-DGT-10": "Kaldu Bubuk Daging 10s",
    "TEH-KNG-20": "Teh Kuning Celup 20s",
    "KCP-MNS-300": "Kecap Manis 300ml",
}


def friendly_sku_name(sku: str) -> str:
    """Format nama produk dari SKU."""
    s = (sku or "").strip()
    if not s:
        return "Produk Tanpa SKU"
    if s in KNOWN_SKU_NAMES:
        return KNOWN_SKU_NAMES[s]
    cleaned = s.replace("-", " ").replace("_", " ")
    words = [w.capitalize() for w in cleaned.split() if w]
    return " ".join(words) if words else s
