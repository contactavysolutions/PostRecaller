"""Lightweight stdio Model Context Protocol (MCP) server for Vercel.
Reads VERCEL_TOKEN from environment and exposes tools:
  - vercel_list_projects
  - vercel_list_deployments
  - vercel_get_deployment_logs
"""
import json
import os
import sys
import urllib.request
import urllib.error

VERCEL_API_BASE = "https://api.vercel.com"


def get_token():
    return os.environ.get("VERCEL_TOKEN") or os.environ.get("VERCEL_API_TOKEN") or ""


def vercel_request(endpoint, method="GET", body=None):
    token = get_token()
    if not token:
        return {"error": "VERCEL_TOKEN environment variable is not set."}

    url = f"{VERCEL_API_BASE}{endpoint}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "Antigravity-Vercel-MCP/1.0",
    }
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {"status": "ok"}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return {"error_code": e.code, "detail": json.loads(err_body)}
        except Exception:
            return {"error_code": e.code, "detail": err_body}
    except Exception as e:
        return {"error": str(e)}


TOOLS = [
    {
        "name": "vercel_list_projects",
        "description": "List all projects in the authenticated Vercel account",
        "inputSchema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "vercel_list_deployments",
        "description": "List recent deployments for a project or the entire account",
        "inputSchema": {
            "type": "object",
            "properties": {
                "projectId": {"type": "string", "description": "Optional Vercel project name or ID"},
                "limit": {"type": "integer", "description": "Maximum deployments to return (default: 10)"},
            },
        },
    },
    {
        "name": "vercel_get_deployment_logs",
        "description": "Get build and runtime error logs for a specific deployment ID",
        "inputSchema": {
            "type": "object",
            "required": ["deploymentId"],
            "properties": {
                "deploymentId": {"type": "string", "description": "The deployment ID or URL to inspect"},
            },
        },
    },
]


def handle_call_tool(name, args):
    if name == "vercel_list_projects":
        return vercel_request("/v9/projects")
    elif name == "vercel_list_deployments":
        limit = args.get("limit", 10)
        proj = args.get("projectId")
        endpoint = f"/v6/deployments?limit={limit}"
        if proj:
            endpoint += f"&projectId={proj}"
        return vercel_request(endpoint)
    elif name == "vercel_get_deployment_logs":
        dep_id = args.get("deploymentId", "").strip()
        return vercel_request(f"/v2/deployments/{dep_id}/events")
    else:
        return {"error": f"Unknown tool: {name}"}


def main():
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        line = line.strip()
        if not line:
            continue

        try:
            req = json.loads(line)
        except Exception:
            continue

        req_id = req.get("id")
        method = req.get("method")

        if method == "initialize":
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "vercel-mcp", "version": "1.0.0"},
                },
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif method == "notifications/initialized":
            continue

        elif method == "tools/list":
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"tools": TOOLS},
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif method == "tools/call":
            params = req.get("params", {})
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            res = handle_call_tool(tool_name, tool_args)
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [
                        {"type": "text", "text": json.dumps(res, indent=2)}
                    ]
                },
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif req_id is not None:
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": f"Method not found: {method}"},
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
