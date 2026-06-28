import re
from typing import Any


class VariableResolver:
    """
    Resolves {{variable}} placeholders in strings.
    Safe against circular references and missing variables.
    """

    PATTERN = re.compile(r"\{\{([^}]+)\}\}")
    MAX_DEPTH = 10  # prevent infinite recursion on circular refs

    def __init__(self, variables: dict[str, str]):
        self.variables = variables

    def resolve(self, text: str, depth: int = 0) -> str:
        """Recursively resolve all {{var}} in text."""
        if not text or depth >= self.MAX_DEPTH:
            return text

        def replace_match(match: re.Match) -> str:
            key = match.group(1).strip()
            value = self.variables.get(key)
            if value is None:
                return match.group(0)  # leave unresolved placeholder as-is
            return self.resolve(value, depth + 1)

        return self.PATTERN.sub(replace_match, text)

    def resolve_params(self, params: list[dict[str, Any]]) -> list[dict[str, str]]:
        """Resolve variables in a list of key-value params."""
        resolved = []
        for item in params:
            if not item.get("enabled", True):
                continue
            resolved.append({
                "key": self.resolve(str(item.get("key", ""))),
                "value": self.resolve(str(item.get("value", ""))),
            })
        return resolved

    def resolve_headers(self, headers: list[dict[str, Any]]) -> dict[str, str]:
        """Resolve variables in headers list and return a dict."""
        result = {}
        for item in headers:
            if not item.get("enabled", True):
                continue
            key = self.resolve(str(item.get("key", ""))).strip()
            value = self.resolve(str(item.get("value", "")))
            if key:
                result[key] = value
        return result

    def resolve_body(self, body: str | None) -> str | None:
        if body is None:
            return None
        return self.resolve(body)

    @classmethod
    def from_environment_variables(cls, variables: list[dict[str, Any]]) -> "VariableResolver":
        """Build resolver from a list of variable objects (with key/value/enabled)."""
        var_map = {
            v["key"]: v["value"]
            for v in variables
            if v.get("enabled", True) and v.get("key")
        }
        return cls(var_map)
