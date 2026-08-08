"""Shared slowapi rate limiter — imported by server.py and route modules.

Behind Kubernetes ingress, `starlette.Request.client.host` is the proxy IP
(uniform across all callers), so slowapi's default `get_remote_address`
cannot distinguish clients. Read `X-Forwarded-For` explicitly and take the
left-most entry (the original client) — falling back to the socket peer.
"""
from slowapi import Limiter


def get_client_ip(request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        first = xff.split(",")[0].strip()
        if first:
            return first
    real = request.headers.get("x-real-ip")
    if real:
        return real.strip()
    if request.client and request.client.host:
        return request.client.host
    return "anon"


limiter = Limiter(key_func=get_client_ip, default_limits=[])
