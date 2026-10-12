import ipaddress
import socket
import httpx
from urllib.parse import urlparse

class SSRFError(Exception):
    pass

class FetchError(Exception):
    pass

class TargetAccessDeniedError(FetchError):
    pass

class TargetNotFoundError(FetchError):
    pass

class RequestTimeoutError(FetchError):
    pass

def is_safe_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return not (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_unspecified)
    except ValueError:
        return False

def resolve_and_check(hostname: str) -> None:
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for result in addr_info:
            ip_str = result[4][0]
            if not is_safe_ip(ip_str):
                raise SSRFError(f"Blocked private IP: {ip_str}")
    except socket.gaierror:
        raise FetchError("Could not resolve hostname")

async def fetch_url_text(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise SSRFError("Only http and https schemes are allowed")
    
    hostname = parsed.hostname
    if not hostname:
        raise SSRFError("Invalid URL")
        
    resolve_and_check(hostname)
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PakkaBot/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, headers=headers) as client:
            # We want to cap the response at 1MB
            async with client.stream("GET", url) as response:
                if response.status_code in (401, 403):
                    raise TargetAccessDeniedError(
                        f"The target website blocked access (HTTP {response.status_code}). "
                        "The website may require login, captcha, or restrict automated analysis."
                    )
                elif response.status_code == 404:
                    raise TargetNotFoundError("The target page was not found (HTTP 404).")
                elif response.status_code >= 400:
                    raise FetchError(f"Target website returned HTTP {response.status_code}")

                content = b""
                async for chunk in response.aiter_bytes():
                    content += chunk
                    if len(content) > 1024 * 1024:
                        raise FetchError("Response exceeds 1MB limit")
                return content.decode("utf-8", errors="replace")
    except httpx.TimeoutException:
        raise RequestTimeoutError("Target website took too long to respond (timeout).")
    except httpx.HTTPStatusError as e:
        if e.response.status_code in (401, 403):
            raise TargetAccessDeniedError(
                f"The target website blocked access (HTTP {e.response.status_code}). "
                "The website may require login, captcha, or restrict automated analysis."
            )
        raise FetchError(f"HTTP request returned status {e.response.status_code}")
    except httpx.RequestError as e:
        raise FetchError(f"HTTP request failed: {e}")
