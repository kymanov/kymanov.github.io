#!/usr/bin/env python3
"""Atölye motor bilgi kartı PDF'lerinden /motor/ sayfalarını üretir.

Kullanım:
    python3 tools/motor-kartlari/build.py kart1.pdf kart2.pdf ...

Her PDF 4 kartlık bir motor kartıdır (MOTOR NN · KART k / 4). Betik:
  - motor/NN/index.html sayfasını yazar,
  - PDF'i motor/pdf/motor-NN.pdf olarak kopyalar,
  - motor/ altındaki mevcut motorları tarayıp motor/index.html listesini yeniden yazar.

Gerekenler: poppler-utils (pdftotext).
"""

import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MOTOR_DIR = ROOT / "motor"
SITE = "https://kymanov.github.io"

CARD_RE = re.compile(r"^MOTOR (\d+) · KART (\d) / 4$")
FOOTER_RE = re.compile(r"^Atölye Motor Bilgi Kartları\s{2,}")


def esc(s):
    return html.escape(s, quote=True)


def split_cols(line):
    return [p for p in re.split(r"\s{2,}", line.strip()) if p]


def read_cards(pdf):
    text = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], check=True,
                          capture_output=True, text=True).stdout
    cards, number = {}, None
    current = None
    for raw in text.splitlines():
        if not raw.strip() or FOOTER_RE.match(raw.strip()):
            continue
        m = CARD_RE.match(raw.strip())
        if m:
            number, k = m.group(1), int(m.group(2))
            current = cards.setdefault(k, [])
            continue
        if current is not None:
            current.append(raw.rstrip())
    if number is None or sorted(cards) != [1, 2, 3, 4]:
        raise SystemExit(f"{pdf}: 4 kart bulunamadı")
    return number, cards


def parse_rows(lines):
    """'Anahtar  Değer' satırları; girintili satırlar bir önceki değerin alt satırıdır."""
    rows = []
    for line in lines:
        cols = split_cols(line)
        if line.startswith(" ") and rows:
            rows[-1]["sub"].append(" ".join(cols))
        elif len(cols) >= 2:
            rows.append({"k": cols[0], "v": " ".join(cols[1:]), "sub": []})
        else:
            rows.append({"k": cols[0], "v": "", "sub": []})
    return rows


def parse_card1(lines):
    title, subtitle = lines[0].strip(), lines[1].strip()
    body = lines[2:]
    boxes = []
    head = [l for l in body[:4] if l.startswith(" ")]
    for i in range(0, len(head) - 1, 2):
        for label, value in zip(split_cols(head[i]), split_cols(head[i + 1])):
            boxes.append({"label": label, "value": value})
    sections, cur = [], None
    for line in body[len(head):]:
        cols = split_cols(line)
        if len(cols) == 1 and line.strip() == line.strip().upper():
            cur = {"title": line.strip(), "rows": []}
            sections.append(cur)
        elif cur is not None:
            cur["rows"].extend(parse_rows([line]))
    return {"title": title, "subtitle": subtitle, "boxes": boxes, "sections": sections}


def parse_card2(lines):
    return {"title": lines[0].strip(), "subtitle": lines[1].strip(), "rows": parse_rows(lines[2:])}


def parse_card3(lines):
    items = []
    for line in lines[2:]:
        m = re.match(r"^\s+(\d+)\s{2,}(.+)$", line)
        if m:
            items.append({"n": m.group(1), "title": m.group(2).strip(), "text": []})
        elif items:
            items[-1]["text"].append(line.strip())
    for it in items:
        it["text"] = " ".join(it["text"])
    return {"title": lines[0].strip(), "subtitle": lines[1].strip(), "items": items}


def parse_card4(lines):
    body = lines[2:]
    box = [l.strip() for l in body if l.startswith(" ")]
    rest = [l.strip() for l in body if not l.startswith(" ")]
    callout = None
    if box:
        label, title = box[0], box[1] if len(box) > 1 else ""
        sub, text = [], []
        for l in box[2:]:
            # Kısa satırlar başlığın alt satırı, ilk uzun satırdan sonrası açıklama
            if not text and len(l) <= 45:
                sub.append(l)
            else:
                text.append(l)
        callout = {"label": label, "title": title, "sub": " ".join(sub), "text": " ".join(text)}
    items, prev_end = [], True
    for l in rest:
        if prev_end:
            items.append({"title": l, "text": []})
            prev_end = False
            continue
        items[-1]["text"].append(l)
        prev_end = l.endswith((".", "!", "?"))
    for it in items:
        it["text"] = " ".join(it["text"])
    return {"title": lines[0].strip(), "subtitle": lines[1].strip(), "callout": callout, "items": items}


def parse_pdf(pdf):
    number, cards = read_cards(pdf)
    return {
        "no": number,
        "kimlik": parse_card1(cards[1]),
        "teknik": parse_card2(cards[2]),
        "ozellik": parse_card3(cards[3]),
        "bakim": parse_card4(cards[4]),
    }


# ---------------------------------------------------------------- HTML

HEAD = """<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <meta name="robots" content="noindex">
    <meta name="theme-color" content="#1e2329">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='3' y='3' width='26' height='26' rx='6' fill='%231e2329'/%3E%3Crect x='3' y='23' width='26' height='3' fill='%23047857'/%3E%3C/svg%3E">
    <link rel="stylesheet" href="{css}">
</head>
<body>
"""


def rows_html(rows):
    out = []
    for r in rows:
        sub = "".join(f"<small>{esc(s)}</small>" for s in r["sub"])
        out.append(f"<div><dt>{esc(r['k'])}</dt><dd>{esc(r['v'])}{sub}</dd></div>")
    return "<dl class=\"rows\">" + "".join(out) + "</dl>"


def motor_page(m):
    k, t, o, b = m["kimlik"], m["teknik"], m["ozellik"], m["bakim"]
    no = m["no"]
    bakim_tab = "Bakım" if b["title"].startswith("Bakım") else b["title"]
    parts = [HEAD.format(title=esc(f"Motor {no} · {k['title']} | Atölye Motor Bilgi Kartları"),
                         desc=esc(f"{k['title']}: {t['subtitle']}. Kimlik, teknik veriler, öne çıkan özellikler ve bakım notları."),
                         css="../motor.css")]
    parts.append(f"""    <header class="m-head">
        <div class="wrap">
            <a class="back" href="../">← Tüm motorlar</a>
            <p class="eyebrow">Motor {esc(no)} · Atölye Motor Bilgi Kartı</p>
            <h1>{esc(k['title'])}</h1>
            <p class="sub">{esc(t['subtitle'])}</p>
        </div>
    </header>
    <nav class="tabs" aria-label="Kart bölümleri">
        <div class="wrap">
            <a href="#kimlik">Kimlik</a><a href="#teknik">Teknik</a><a href="#ozellikler">Özellikler</a><a href="#bakim">{esc(bakim_tab)}</a>
        </div>
    </nav>
    <main class="wrap">
""")
    # Kart 1
    boxes = "".join(f"<div class=\"box\"><span>{esc(x['label'])}</span><strong>{esc(x['value'])}</strong></div>" for x in k["boxes"])
    secs = "".join(f"<h3>{esc(s['title'])}</h3>{rows_html(s['rows'])}" for s in k["sections"])
    parts.append(f"""        <section class="card" id="kimlik">
            <p class="kart">Kart 1 / 4</p>
            <h2>Kimlik</h2>
            <p class="lead">{esc(k['subtitle'])}</p>
            <div class="boxes">{boxes}</div>
            {secs}
        </section>
""")
    # Kart 2
    parts.append(f"""        <section class="card" id="teknik">
            <p class="kart">Kart 2 / 4</p>
            <h2>{esc(t['title'])}</h2>
            <p class="lead">{esc(t['subtitle'])}</p>
            {rows_html(t['rows'])}
        </section>
""")
    # Kart 3
    items = "".join(f"<li><span class=\"num\">{esc(i['n'])}</span><div><h3>{esc(i['title'])}</h3><p>{esc(i['text'])}</p></div></li>" for i in o["items"])
    parts.append(f"""        <section class="card" id="ozellikler">
            <p class="kart">Kart 3 / 4</p>
            <h2>{esc(o['title'])}</h2>
            <p class="lead">{esc(o['subtitle'])}</p>
            <ol class="features">{items}</ol>
        </section>
""")
    # Kart 4
    c = b["callout"]
    callout = ""
    if c:
        sub = f"<p class=\"c-sub\">{esc(c['sub'])}</p>" if c["sub"] else ""
        callout = f"<div class=\"callout\"><p class=\"c-label\">{esc(c['label'])}</p><p class=\"c-title\">{esc(c['title'])}</p>{sub}<p>{esc(c['text'])}</p></div>"
    notes = "".join(f"<div class=\"note\"><h3>{esc(i['title'])}</h3><p>{esc(i['text'])}</p></div>" for i in b["items"])
    parts.append(f"""        <section class="card" id="bakim">
            <p class="kart">Kart 4 / 4</p>
            <h2>{esc(b['title'])}</h2>
            <p class="lead">{esc(b['subtitle'])}</p>
            {callout}
            {notes}
        </section>

        <div class="actions">
            <a class="btn" href="../pdf/motor-{esc(no)}.pdf" download>Kartları PDF olarak indir</a>
            <a class="btn btn-ghost" href="../">Tüm motorlar</a>
        </div>
    </main>

    <footer class="m-foot">
        <div class="wrap foot-row"><span>Ege Üniversitesi Otomotiv Teknolojisi Bölümü</span><span>Claude, Güz Arat Başkurt ve kymanov</span></div>
    </footer>
</body>
</html>
""")
    return "".join(parts)


def box_value(m, *labels):
    for x in m["kimlik"]["boxes"]:
        if x["label"] in labels:
            return x["value"]
    return ""


def index_page(motors):
    cards = []
    for m in motors:
        code = box_value(m, "MOTOR KODU", "SINIF")
        facts = " · ".join(v for v in [box_value(m, "HACİM"), box_value(m, "GÜÇ")] if v)
        cards.append(f"""            <a class="motor" href="{esc(m['no'])}/">
                <span class="m-no">Motor {esc(m['no'])}</span>
                <strong>{esc(m['kimlik']['title'])}</strong>
                <span class="m-code">{esc(code)}</span>
                <span class="m-facts">{esc(facts)}</span>
            </a>
""")
    return HEAD.format(title="Atölye Motor Bilgi Kartları", desc="Atölyedeki motorların bilgi kartları: kimlik, teknik veriler, öne çıkan özellikler ve bakım notları.", css="motor.css") + f"""    <header class="m-head">
        <div class="wrap">
            <p class="eyebrow">Atölye Motor Bilgi Kartları</p>
            <h1>Atölyedeki motorlar</h1>
            <p class="sub">Motorun üzerindeki karekodu okutarak ya da aşağıdan seçerek bilgi kartına ulaşabilirsiniz.</p>
        </div>
    </header>
    <main class="wrap">
        <div class="motor-list">
{''.join(cards)}        </div>
    </main>

    <footer class="m-foot">
        <div class="wrap foot-row"><span>Ege Üniversitesi Otomotiv Teknolojisi Bölümü</span><span>Claude, Güz Arat Başkurt ve kymanov</span></div>
    </footer>
</body>
</html>
"""


def main(pdfs):
    MOTOR_DIR.joinpath("pdf").mkdir(parents=True, exist_ok=True)
    data_file = MOTOR_DIR / "motorlar.json"
    data = json.loads(data_file.read_text(encoding="utf-8")) if data_file.exists() else {}
    for pdf in map(Path, pdfs):
        m = parse_pdf(pdf)
        data[m["no"]] = m
        out = MOTOR_DIR / m["no"]
        out.mkdir(exist_ok=True)
        (out / "index.html").write_text(motor_page(m), encoding="utf-8")
        dest = MOTOR_DIR / "pdf" / f"motor-{m['no']}.pdf"
        if not (dest.exists() and dest.samefile(pdf)):
            shutil.copyfile(pdf, dest)
        print(f"Motor {m['no']}: {m['kimlik']['title']} -> {SITE}/motor/{m['no']}/")
    data = dict(sorted(data.items()))
    data_file.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    (MOTOR_DIR / "index.html").write_text(index_page(list(data.values())), encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    main(sys.argv[1:])
