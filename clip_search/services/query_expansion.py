import json
import re

from openai import OpenAI


_SYSTEM_PROMPT = (
    "You are a CLIP query generator.\n"
    "Do NOT explain. Do NOT think step-by-step.\n"
    "Output ONLY the final answer.\n\n"
    "Task:\n"
    "Convert Korean input into ONE short English visual description.\n\n"
    "Rules:\n"
    "- Max 10 words\n"
    "- Only visible objects and actions\n"
    "- Use simple nouns and verbs\n"
    "- No abstract words\n"
    "- No person/someone\n"
    "Output format:\n"
    "{\"query\": \"...\"}\n"
)


class OpenAIQueryExpander:
    def __init__(self, model: str = "gpt-4o-mini") -> None:
        self._client = OpenAI()
        self._model = model

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
        response = self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            max_tokens=80,
            temperature=0,
            response_format={"type": "json_object"},
        )
        raw_text = response.choices[0].message.content.strip()
        query = self._parse_query(raw_text)
        if not query:
            query = korean_query

        print(f"[expand] '{korean_query}'  ->  '{query}'")
        return query

    @staticmethod
    def _parse_query(raw_text: str) -> str:
        raw_text = OpenAIQueryExpander._strip_thinking(raw_text)

        try:
            parsed = json.loads(raw_text)
            if isinstance(parsed, dict):
                return OpenAIQueryExpander._clean_query(str(parsed.get("query", "")))
            if isinstance(parsed, list):
                for item in parsed:
                    query = OpenAIQueryExpander._clean_query(str(item))
                    if query:
                        return query
            elif isinstance(parsed, str) and parsed.strip():
                return OpenAIQueryExpander._clean_query(parsed)
        except json.JSONDecodeError:
            pass

        for line in raw_text.splitlines():
            cleaned = OpenAIQueryExpander._clean_query(line)
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
