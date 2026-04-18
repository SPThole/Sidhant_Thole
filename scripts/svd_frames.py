"""
Generate SVD rank-progression frames from a profile image.

Usage:
    python3 scripts/svd_frames.py images/profile_source.png

Outputs PNG frames to images/profile/rank_XXX.png at ranks:
    1, 2, 3, 5, 8, 12, 18, 25, 35, 50, 70, 100, 140, 180, 220, full

The site's JS cycles through these to create the "SVD-to-full" intro animation.

Requires: numpy, Pillow
    pip install numpy pillow
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

# Rank progression — log-ish so the animation feels smooth.
RANKS = [1, 2, 3, 5, 8, 12, 18, 25, 35, 50, 70, 100, 140, 180, 220, None]
TARGET_SIZE = 360   # square output size (retina-friendly at 180px CSS)


def svd_reconstruct(channel: np.ndarray, k: int) -> np.ndarray:
    U, S, Vt = np.linalg.svd(channel, full_matrices=False)
    k = min(k, len(S))
    return (U[:, :k] * S[:k]) @ Vt[:k, :]


def main(src_path: str) -> None:
    src = Path(src_path)
    if not src.exists():
        sys.exit(f"Source image not found: {src}")

    img = Image.open(src).convert("RGB")
    w, h = img.size
    side = min(w, h)
    left, top = (w - side) // 2, (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((TARGET_SIZE, TARGET_SIZE), Image.LANCZOS)

    arr = np.asarray(img, dtype=np.float32)

    out_dir = Path(__file__).resolve().parent.parent / "images" / "profile"
    out_dir.mkdir(parents=True, exist_ok=True)

    max_rank = min(arr.shape[0], arr.shape[1])

    for i, k in enumerate(RANKS):
        if k is None or k >= max_rank:
            frame = arr.astype(np.uint8)
            label = "full"
            actual_k = max_rank
        else:
            channels = [svd_reconstruct(arr[..., c], k) for c in range(3)]
            frame = np.clip(np.stack(channels, axis=-1), 0, 255).astype(np.uint8)
            label = f"{k:03d}"
            actual_k = k

        out_name = f"rank_{label}.png"
        Image.fromarray(frame).save(out_dir / out_name, optimize=True)
        print(f"  rank {actual_k:>3} -> {out_name}")

    # Write a manifest the site can read for frame ordering.
    manifest_path = out_dir / "manifest.json"
    manifest = []
    for k in RANKS:
        if k is None or k >= max_rank:
            manifest.append({"rank": max_rank, "file": "rank_full.png"})
        else:
            manifest.append({"rank": k, "file": f"rank_{k:03d}.png"})
    import json
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"  manifest -> {manifest_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python3 scripts/svd_frames.py <source_image>")
    main(sys.argv[1])
