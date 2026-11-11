#!/usr/bin/env python3
"""motor/motorlar.json içindeki her motor için karekod ve basılabilir etiket sayfası üretir.

Kullanım:
    python3 tools/motor-kartlari/qr.py CIKTI_KLASORU

Çıktı:
    <motor-adi>.svg / .png  her motorun sayfasına giden karekod
    etiketler.html               A4'e 9 etiket, tarayıcıdan yazdırılabilir

Gerekenler: pip install qrcode pillow
"""

import html
import json
import sys
from pathlib import Path

import qrcode
import qrcode.image.svg

ROOT = Path(__file__).resolve().parents[2]
SITE = "https://kymanov.github.io"


def url_for(slug):
    return f"{SITE}/motor/{slug}/"


def make_qr(data):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    return qr


LABEL_CSS = """
@page { size: A4; margin: 10mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1e2329; }
.sheet { display: grid; grid-template-columns: repeat(3, 60mm); grid-auto-rows: 88mm; gap: 4mm; justify-content: center; }
.label { border: 0.3mm dashed #b8bcc4; border-radius: 3mm; overflow: hidden; display: flex; flex-direction: column; break-inside: avoid; }
.top { background: #1e2329; color: #fff; border-bottom: 1.2mm solid #047857; padding: 3mm 3.5mm 2.6mm; }
.no { font-size: 7.5pt; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.75; }
.name { font-size: 10.5pt; font-weight: 800; line-height: 1.15; margin-top: 0.8mm; }
.code { font-size: 8pt; opacity: 0.8; margin-top: 0.6mm; }
.qr { flex: 1; display: grid; place-items: center; padding: 2.5mm; }
.qr svg { width: 42mm; height: 42mm; }
.hint { text-align: center; font-size: 8pt; font-weight: 700; color: #047857; }
.url { text-align: center; font-size: 6.8pt; color: #5f6670; padding: 0.8mm 2mm 3mm; word-break: break-all; }
"""


def main(out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    data = json.loads((ROOT / "motor" / "motorlar.json").read_text(encoding="utf-8"))
    labels = []
    for no, m in data.items():
        slug = m["slug"]
        url = url_for(slug)
        qr = make_qr(url)
        qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(out / f"{slug}.svg")
        qr.box_size = 30
        qr.make_image(fill_color="black", back_color="white").save(out / f"{slug}.png")
        svg = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).to_string(encoding="unicode")
        code = next((b["value"] for b in m["kimlik"]["boxes"] if b["label"] in ("MOTOR KODU", "MOTOR AİLESİ", "SINIF")), "")
        labels.append(f"""<div class="label">
  <div class="top"><div class="no">Motor {html.escape(no)}</div><div class="name">{html.escape(m['kimlik']['title'])}</div><div class="code">{html.escape(code)}</div></div>
  <div class="qr">{svg}</div>
  <div class="hint">Bilgi kartı için okutun</div>
  <div class="url">{html.escape(url.replace('https://', ''))}</div>
</div>""")
        print(f"Motor {no}: {url}")
    page = f"""<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"><title>Motor karekod etiketleri</title><style>{LABEL_CSS}</style></head>
<body><div class="sheet">
{chr(10).join(labels)}
</div></body></html>
"""
    (out / "etiketler.html").write_text(page, encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
