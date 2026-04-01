import { NextResponse } from "next/server";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (!secretKey || !priceId) {
    return NextResponse.json(
      { error: "Stripe environment variables are not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const session = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: session.error?.message ?? "Stripe error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
