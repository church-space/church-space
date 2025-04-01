// lib/stripe.js
import Stripe from "stripe";

const stripeSecretKey =
  process.env.NEXT_PUBLIC_STRIPE_ENV === "testing"
    ? process.env.STRIPE_TESTING_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: "2025-02-24.acacia",
});

export default stripe;
