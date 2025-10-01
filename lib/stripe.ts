
import Stripe from 'stripe';

// Only initialize Stripe if the secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null;

export const PRICE_ID = process.env.STRIPE_PRICE_ID || '';

export default stripe;
