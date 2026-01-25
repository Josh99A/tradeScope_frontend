import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const resolved = await params;
  const id = resolved?.id;
  if (resource === "trade-requests") {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/admin/trade-requests/${id}/`,
      { headers: { Cookie: cookie } }
    );
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    appendSetCookies(res, response);
    return response;
  }
  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/assets/${id}/`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const resolved = await params;
  const id = resolved?.id;
  if (resource === "trade-requests") {
    return NextResponse.json(
      { detail: "Unsupported request." },
      { status: 400 }
    );
  }
  const contentType = req.headers.get("content-type") || "";
  let body: BodyInit | null = null;
  const headers: Record<string, string> = { Cookie: cookie };

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const forward = new FormData();
    form.forEach((value, key) => {
      forward.append(key, value);
    });
    body = forward;
  } else {
    const json = await req.json();
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/assets/${id}/`, {
    method: "PATCH",
    headers,
    body,
  });
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const resolved = await params;
  const id = resolved?.id;
  if (resource === "trade-requests") {
    return NextResponse.json(
      { detail: "Unsupported request." },
      { status: 400 }
    );
  }
  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/assets/${id}/`, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });
  const response = NextResponse.json(
    { ok: res.ok },
    { status: res.status }
  );
  appendSetCookies(res, response);
  return response;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const action = url.searchParams.get("action");
  const resolved = await params;
  const id = resolved?.id;
  if (resource !== "trade-requests" || !action) {
    return NextResponse.json({ detail: "Unsupported request." }, { status: 400 });
  }
  const body = await req.json();
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/admin/trade-requests/${id}/${action}/`,
    {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
