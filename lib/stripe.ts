
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID || '';

export default stripe;
