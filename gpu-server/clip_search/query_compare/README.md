# Query Mode Frame Comparison

Compare whether OpenAI query expansion improves CLIP frame search by saving the top matching frame for three modes:

1. `ko_raw`: original Korean query passed directly to CLIP.
2. `translated`: literal English translation only.
3. `clip_friendly`: existing OpenAI CLIP-friendly visual query expansion.

## Run

From `clip_search`:

```bash
python query_compare/compare_query_modes.py \
  --video ./example.mov \
  --query "여기에 한글 검색어" \
  --output-dir ./query_compare/runs \
  --fps 2
```

Outputs:

- `top1_comparison.jpg`: the three top frames arranged side by side.
- `frames/ko_raw_top1_*.jpg`: top frame for original Korean.
- `frames/translated_top1_*.jpg`: top frame for literal English translation.
- `frames/clip_friendly_top1_*.jpg`: top frame for CLIP-friendly query expansion.

`OPENAI_API_KEY` must be set because the translated and CLIP-friendly modes call the OpenAI API.
