import ipaddress
import socket
import httpx
from urllib.parse import urlparse, urljoin

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
        return ip.is_global
    except ValueError:
        return False

def resolve_and_check(hostname: str) -> str:
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        validated_ip = None
        for result in addr_info:
            ip_str = result[4][0]
            try:
                ip = ipaddress.ip_address(ip_str)
                if not ip.is_global:
                    raise SSRFError(f"Blocked private IP: {ip_str}")
            except ValueError:
                raise SSRFError(f"Blocked private IP: {ip_str}")
            if validated_ip is None:
                validated_ip = ip_str
        if not validated_ip:
            raise FetchError("Could not resolve hostname")
        return validated_ip
    except socket.gaierror:
        raise FetchError("Could not resolve hostname")

MAX_REDIRECTS = 5

async def fetch_url_text(url: str) -> str:
    current_url = url
    redirect_count = 0

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PakkaBot/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=False, headers=headers) as client:
            while True:
                parsed = urlparse(current_url)
                if parsed.scheme not in ("http", "https"):
                    raise SSRFError("Only http and https schemes are allowed")
                
                hostname = parsed.hostname
                if not hostname:
                    raise SSRFError("Invalid URL")
                    
                validated_ip = resolve_and_check(hostname)

                req_url = current_url
                req_headers = dict(headers)
                if parsed.scheme == "http":
                    port_str = f":{parsed.port}" if parsed.port else ""
                    ip_host = f"[{validated_ip}]" if ":" in validated_ip else validated_ip
                    netloc = f"{ip_host}{port_str}"
                    req_url = parsed._replace(netloc=netloc).geturl()
                    req_headers["Host"] = parsed.netloc

                # We want to cap the response at 1MB
                async with client.stream("GET", req_url, headers=req_headers) as response:
                    if response.status_code in (301, 302, 303, 307, 308) and "location" in response.headers:
                        if redirect_count >= MAX_REDIRECTS:
                            raise FetchError("Too many redirects")
                        redirect_count += 1
                        location = response.headers["location"]
                        current_url = urljoin(current_url, location)
                        continue

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
