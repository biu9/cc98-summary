import { NextRequest, NextResponse } from "next/server";

const CC98_TOKEN_URL = "https://openid.cc98.org/connect/token";

function postClientSecretPost(body: string, secret: string) {
  const params = new URLSearchParams(body);
  params.set("client_secret", secret);
  return fetch(CC98_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });
}

function postClientSecretBasic(body: string, secret: string) {
  const params = new URLSearchParams(body);
  const clientId = params.get("client_id");
  if (!clientId) {
    throw new Error("missing client_id");
  }
  params.delete("client_secret");
  const forward = new URLSearchParams();
  for (const key of ["grant_type", "code", "redirect_uri", "code_verifier", "refresh_token", "scope"]) {
    const v = params.get(key);
    if (v != null) {
      forward.set(key, v);
    }
  }
  const basic = Buffer.from(`${clientId}:${secret}`, "utf8").toString("base64");
  return fetch(CC98_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${basic}`,
    },
    body: forward.toString(),
  });
}

/**
 * 机密客户端换 token：浏览器只 POST 到本站，由服务端转发并附带 client_secret。
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CC98_CLIENT_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        error: "server_error",
        error_description:
          "Missing CC98_CLIENT_SECRET. Set it in .env.local (local) or project env (Vercel).",
      },
      { status: 500 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/x-www-form-urlencoded")) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Expected application/x-www-form-urlencoded" },
      { status: 400 }
    );
  }

  const raw = await request.text();

  let res = await postClientSecretPost(raw, secret);
  let text = await res.text();

  if (res.status === 400 && text.includes("invalid_client")) {
    try {
      res = await postClientSecretBasic(raw, secret);
      text = await res.text();
    } catch {
      // keep first response
    }
  }

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
    },
  });
}
