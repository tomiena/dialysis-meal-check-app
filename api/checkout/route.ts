import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: "price_1TGYrtRzSsWYNjYZHF85C4z5",
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3005/success",
    cancel_url: "http://localhost:3005/cancel",
  });

  return Response.json({ url: session.url });
}