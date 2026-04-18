import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: "https://food-app-sr7i.vercel.app/success",
      cancel_url: "https://food-app-sr7i.vercel.app/cancel",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    return NextResponse.json(
      { error: "Stripeセッションの作成に失敗しました。" },
      { status: 500 }
    );
  }
}