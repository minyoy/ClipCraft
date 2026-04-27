import json
import re

from llama_cpp import Llama


_SYSTEM_PROMPT = (
    "You are generating CLIP search queries.\n\n"
    "Convert Korean input into one short English visual description.\n\n"
    "Rules:\n"
    "- Max 10 words per sentence\n"
    "- No explanation\n"
    "- No abstract words\n"
    "- Only visible objects and actions\n"
    "- Use simple nouns and verbs\n"
    "- Avoid person/someone\n"
    "- Output only one JSON string"
)


class QwenQueryExpander:
    def __init__(self, model_path: str = "./models/qwen-q4.gguf") -> None:
        self._llm = Llama(
            model_path=model_path,
            n_ctx=1024,
            n_gpu_layers=-1,
            verbose=False,
        )

    def expand(self, korean_query: str) -> str:
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Scene: {korean_query}\n"
                    "Return exactly one query string as JSON."
                ),
            },
        ]
        response = self._llm.create_chat_completion(messages=messages, max_tokens=80)
        raw_text = response["choices"][0]["message"]["content"].strip()
        query = self._parse_query(raw_text)
        if not query:
            query = korean_query

        print(f"[expand] '{korean_query}'  ->  '{query}'")
        return query

    @staticmethod
    def _parse_query(raw_text: str) -> str:
        raw_text = QwenQueryExpander._strip_thinking(raw_text)

        try:
            parsed = json.loads(raw_text)
            if isinstance(parsed, list):
                for item in parsed:
                    query = QwenQueryExpander._clean_query(str(item))
                    if query:
                        return query
            elif isinstance(parsed, str) and parsed.strip():
                return QwenQueryExpander._clean_query(parsed)
        except json.JSONDecodeError:
            pass

        for line in raw_text.splitlines():
            cleaned = QwenQueryExpander._clean_query(line)
            if cleaned:
                return cleaned

        return ""

    @staticmethod
    def _strip_thinking(raw_text: str) -> str:
        text = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"</?think>", "", text, flags=re.IGNORECASE)
        return text.strip()

    @staticmethod
    def _clean_query(query: str) -> str:
        cleaned = re.sub(r"^\s*(?:[-*]|\d+[.)])\s*", "", query).strip().strip('"')
        if not cleaned or cleaned.lower() in {"<think>", "</think>"}:
            return ""
        return cleaned
