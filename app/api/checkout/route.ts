import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  // ── 環境変数チェック ──────────────────────────────────────
  const secretKey  = process.env.STRIPE_SECRET_KEY;
  const priceId    = process.env.STRIPE_PRICE_ID;
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!secretKey) {
    console.error("[checkout] STRIPE_SECRET_KEY が未設定です");
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY が設定されていません" },
      { status: 500 }
    );
  }
  if (!priceId) {
    console.error("[checkout] STRIPE_PRICE_ID が未設定です");
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID が設定されていません" },
      { status: 500 }
    );
  }

  // ── Stripe セッション作成 ─────────────────────────────────
  try {
    const stripe  = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/success`,
      cancel_url:  `${appUrl}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[checkout] Stripe エラー:", message);
    return NextResponse.json(
      { error: `Stripe エラー: ${message}` },
      { status: 500 }
    );
  }
}
