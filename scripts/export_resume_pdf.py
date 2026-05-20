#!/usr/bin/env python3
"""
Export homepage to a single-page résumé-style PDF.

Steps:
  1. Open local index.html in headless Chromium.
  2. Add class `pdf-resume` on <html> (see assets/css/pdf-resume.css).
  3. Binary-search PDF scale so the document fits on one A4 page when possible.
"""

from __future__ import annotations

import subprocess
import tempfile
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
OUT = ROOT / "index.pdf"


def count_pdf_pages(path: Path) -> int:
    """Return page count via poppler pdfinfo."""
    txt = subprocess.check_output(
        ["pdfinfo", str(path)],
        text=True,
        stderr=subprocess.DEVNULL,
        timeout=30,
    )
    for line in txt.splitlines():
        if line.startswith("Pages:"):
            return int(line.split(":", maxsplit=1)[1].strip())
    raise RuntimeError("pdfinfo: missing Pages line")


def render_pdf_scaled(page, path: Path, scale: float) -> None:
    """Write A4 PDF with margins; preserves background colors."""
    page.pdf(
        path=str(path),
        format="A4",
        print_background=True,
        margin={"top": "4mm", "right": "5mm", "bottom": "4mm", "left": "5mm"},
        scale=scale,
    )


def binary_search_best_scale(page) -> float:
    """Largest scale such that Chromium still emits a single-page PDF."""
    lo, hi = 0.15, 1.0
    best = lo
    for _ in range(18):
        mid = (lo + hi) / 2
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as fh:
            tmp = Path(fh.name)
        try:
            render_pdf_scaled(page, tmp, mid)
            page_count = count_pdf_pages(tmp)
        finally:
            tmp.unlink(missing_ok=True)

        if page_count <= 1:
            best = mid
            lo = mid
        else:
            hi = mid
        if hi - lo < 0.004:
            break
    return best


def main() -> None:
    url = HTML.as_uri()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 中文：近似 A4 可印宽度，单列换行以降低总高度（利于单页）。
        context = browser.new_context(
            viewport={"width": 620, "height": 880},
            device_scale_factor=1,
        )
        pw_page = context.new_page()
        pw_page.goto(url, wait_until="networkidle", timeout=120_000)
        pw_page.evaluate("document.documentElement.classList.add('pdf-resume')")
        time.sleep(0.35)
        scale = binary_search_best_scale(pw_page)
        render_pdf_scaled(pw_page, OUT, scale)
        browser.close()

    pages = count_pdf_pages(OUT)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes) scale={scale:.3f} pages={pages}")
    if pages > 1:
        print(
            "Warning: still multi-page — shorten content or lower lo in binary_search_best_scale.",
        )


if __name__ == "__main__":
    main()
