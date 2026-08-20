from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps


def signature(path: Path, size: tuple[int, int] = (64, 36)) -> tuple[list[int], list[int]]:
    with Image.open(path) as source:
        image = ImageOps.fit(source.convert("RGB"), size, method=Image.Resampling.LANCZOS)
        gray = image.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        return list(gray.getdata()), list(edges.getdata())


def distance(reference: tuple[list[int], list[int]], candidate: tuple[list[int], list[int]]) -> int:
    ref_gray, ref_edges = reference
    frame_gray, frame_edges = candidate
    gray_error = sum((a - b) ** 2 for a, b in zip(ref_gray, frame_gray))
    edge_error = sum((a - b) ** 2 for a, b in zip(ref_edges, frame_edges))
    return gray_error + edge_error // 2


def main() -> None:
    parser = argparse.ArgumentParser(description="Find video frames closest to station reference images.")
    parser.add_argument("frames", type=Path)
    parser.add_argument("references", type=Path)
    parser.add_argument("--top", type=int, default=5)
    args = parser.parse_args()

    frames = sorted(args.frames.glob("frame_*.webp"))
    references = sorted(args.references.glob("station_*.png"))
    if not frames or not references:
        raise SystemExit("frames or references missing")

    frame_signatures = [(frame, signature(frame)) for frame in frames]
    search_ranges = [(0, 81), (82, 165), (166, 259), (260, 360)]
    for index, reference in enumerate(references):
        ref_signature = signature(reference)
        start, end = search_ranges[index]
        candidates = [
            (frame, frame_signature)
            for frame, frame_signature in frame_signatures
            if start <= int(frame.stem.rsplit("_", 1)[1]) <= end
        ]
        ranked = sorted(
            ((distance(ref_signature, frame_signature), frame) for frame, frame_signature in candidates),
            key=lambda item: item[0],
        )
        print(f"{reference.name}  search={start / 24:.3f}s..{end / 24:.3f}s")
        for score, frame in ranked[: args.top]:
            frame_number = int(frame.stem.rsplit("_", 1)[1])
            print(f"  {frame.name}  {frame_number / 24:.3f}s  score={score}")


if __name__ == "__main__":
    main()
