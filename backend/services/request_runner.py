import time
import json
import base64
import logging
from typing import Any, Optional
from urllib.parse import urlencode
import httpx
from backend.schemas.runner import RunRequest, RunResponse
from backend.services.variable_resolver import VariableResolver
from backend.config import settings

logger = logging.getLogger(__name__)

# HTTP status code descriptions
STATUS_TEXTS: dict[int, str] = {
    100: "Continue", 101: "Switching Protocols",
    200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
    301: "Moved Permanently", 302: "Found", 304: "Not Modified",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
    404: "Not Found", 405: "Method Not Allowed", 409: "Conflict",
    422: "Unprocessable Entity", 429: "Too Many Requests",
    500: "Internal Server Error", 502: "Bad Gateway",
    503: "Service Unavailable", 504: "Gateway Timeout",
}


class RequestRunner:
    """
    Executes HTTP requests on behalf of the frontend using httpx.
    Handles variable resolution, auth injection, error classification.
    """

    def __init__(self, resolver: Optional[VariableResolver] = None):
        self.resolver = resolver or VariableResolver({})

    async def run(self, req: RunRequest) -> RunResponse:
        try:
            return await self._execute(req)
        except httpx.TimeoutException:
            return RunResponse(
                status_code=0,
                status_text="Timeout",
                headers={},
                body="",
                response_time_ms=int(req.timeout * 1000),
                response_size_bytes=0,
                content_type="",
                error=f"Request timed out after {req.timeout}s",
            )
        except httpx.RequestError as e:
            if "SSL" in str(e) or "certificate" in str(e):
                return RunResponse(
                    status_code=0,
                    status_text="SSL Error",
                    headers={},
                    body="",
                    response_time_ms=0,
                    response_size_bytes=0,
                    content_type="",
                    error=f"SSL certificate error: {str(e)}",
                )
            return RunResponse(
                status_code=0,
                status_text="Request Error",
                headers={},
                body="",
                response_time_ms=0,
                response_size_bytes=0,
                content_type="",
                error=f"Request failed: {str(e)}",
            )
        except httpx.InvalidURL as e:
            return RunResponse(
                status_code=0,
                status_text="Invalid URL",
                headers={},
                body="",
                response_time_ms=0,
                response_size_bytes=0,
                content_type="",
                error=f"Invalid URL: {str(e)}",
            )
        except httpx.TooManyRedirects:
            return RunResponse(
                status_code=0,
                status_text="Too Many Redirects",
                headers={},
                body="",
                response_time_ms=0,
                response_size_bytes=0,
                content_type="",
                error="Too many redirects",
            )
        except Exception as e:
            logger.exception("Unexpected error in RequestRunner")
            return RunResponse(
                status_code=0,
                status_text="Error",
                headers={},
                body="",
                response_time_ms=0,
                response_size_bytes=0,
                content_type="",
                error=f"Unexpected error: {str(e)}",
            )

    async def _execute(self, req: RunRequest) -> RunResponse:
        # 1. Resolve variables
        resolved_url = self.resolver.resolve(req.url)
        resolved_params = self.resolver.resolve_params(req.params)
        resolved_headers = self.resolver.resolve_headers(req.headers)
        resolved_body = self.resolver.resolve_body(req.body_content)

        # 2. Validate URL
        if not resolved_url.startswith(("http://", "https://")):
            if resolved_url.startswith("localhost") or resolved_url.startswith("127.0.0.1"):
                resolved_url = f"http://{resolved_url}"
            else:
                resolved_url = f"https://{resolved_url}"

        # 3. Build auth header
        auth_headers = self._build_auth_headers(req.auth_type, req.auth_data)
        resolved_headers.update(auth_headers)

        # 4. Prepare request kwargs
        request_kwargs = {
            "method": req.method,
            "url": resolved_url,
            "params": [
                (item["key"], str(item["value"]))
                for item in resolved_params
                if item.get("key")
            ],
            "headers": resolved_headers,
        }

        if req.body_type == "form-data":
            try:
                items = json.loads(resolved_body or "[]")
                files_payload = {
                    item["key"]: (None, str(item["value"]))
                    for item in items
                    if item.get("enabled", True) and item.get("key")
                }
                if files_payload:
                    request_kwargs["files"] = files_payload
                # httpx manages the boundary for multipart automatically
                request_kwargs["headers"].pop("Content-Type", None)
                request_kwargs["headers"].pop("content-type", None)
            except Exception:
                request_kwargs["content"] = (resolved_body or "").encode("utf-8")
        else:
            content, content_type = self._build_body(req.body_type, resolved_body)
            if content_type and "content-type" not in {k.lower() for k in request_kwargs["headers"]}:
                request_kwargs["headers"]["Content-Type"] = content_type
            request_kwargs["content"] = content

        # 5. Execute
        start_time = time.monotonic()

        async with httpx.AsyncClient(
            timeout=httpx.Timeout(req.timeout if req.timeout > 0 else None),
            follow_redirects=req.follow_redirects,
            verify=True,
            limits=httpx.Limits(max_connections=10),
        ) as client:
            response = await client.request(**request_kwargs)

        elapsed_ms = int((time.monotonic() - start_time) * 1000)

        # 6. Read body (limit size)
        body_bytes = response.content
        size = len(body_bytes)

        if size > settings.MAX_RESPONSE_SIZE:
            body_text = body_bytes[: settings.MAX_RESPONSE_SIZE].decode("utf-8", errors="replace")
            body_text += f"\n\n[Response truncated — showing {settings.MAX_RESPONSE_SIZE // 1024}KB of {size // 1024}KB]"
        else:
            body_text = body_bytes.decode("utf-8", errors="replace")

        content_type_header = response.headers.get("content-type", "")

        return RunResponse(
            status_code=response.status_code,
            status_text=STATUS_TEXTS.get(response.status_code, "Unknown"),
            headers=dict(response.headers),
            body=body_text,
            response_time_ms=elapsed_ms,
            response_size_bytes=size,
            content_type=content_type_header,
        )

    def _build_auth_headers(self, auth_type: str, auth_data: dict[str, Any]) -> dict[str, str]:
        if auth_type == "bearer":
            token = self.resolver.resolve(auth_data.get("token", ""))
            if token:
                return {"Authorization": f"Bearer {token}"}
        elif auth_type == "basic":
            username = self.resolver.resolve(auth_data.get("username", ""))
            password = self.resolver.resolve(auth_data.get("password", ""))
            if username:
                credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
                return {"Authorization": f"Basic {credentials}"}
        return {}

    def _build_body(
        self,
        body_type: str,
        body_content: Optional[str],
    ) -> tuple[Optional[bytes], Optional[str]]:
        """Returns (content_bytes, content_type_string)."""
        if body_type == "none" or not body_content:
            return None, None

        if body_type in ("json",):
            return body_content.encode("utf-8"), "application/json"

        if body_type == "text":
            return body_content.encode("utf-8"), "text/plain"

        if body_type == "xml":
            return body_content.encode("utf-8"), "application/xml"

        if body_type == "form-data":
            # body_content is JSON-encoded list of {key, value, enabled}
            try:
                items = json.loads(body_content or "[]")
                form_data = {
                    item["key"]: item["value"]
                    for item in items
                    if item.get("enabled", True) and item.get("key")
                }
                return urlencode(form_data).encode(), "application/x-www-form-urlencoded"
            except Exception:
                return body_content.encode("utf-8"), "application/x-www-form-urlencoded"

        if body_type == "x-www-form-urlencoded":
            try:
                items = json.loads(body_content or "[]")
                form_data = [
                    (item["key"], str(item["value"]))
                    for item in items
                    if item.get("enabled", True) and item.get("key")
                ]
                return urlencode(form_data).encode(), "application/x-www-form-urlencoded"
            except Exception:
                return body_content.encode("utf-8"), "application/x-www-form-urlencoded"

        return body_content.encode("utf-8"), "application/octet-stream"
