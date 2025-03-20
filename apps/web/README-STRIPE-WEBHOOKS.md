# Stripe Webhooks Setup Guide

This document explains how to properly configure Stripe webhooks with this application when deployed on Vercel.

## Current Issue

The Stripe webhook signature verification is failing because Vercel's proxy is modifying the request body before it reaches our webhook handler. The signature verification relies on the exact raw body that Stripe sent originally.

## Solutions

### Option 1: Environment Variable Flag (Development/Testing Only)

For development or temporary testing, you can set an environment variable to bypass signature verification:

```
DISABLE_WEBHOOK_VERIFICATION=true
```

**WARNING:** This should NEVER be enabled in production as it bypasses an important security measure.

### Option 2: Raw Body API Route Configuration (Recommended)

1. In your Vercel project settings, go to "Environment Variables" and add:

```
STRIPE_WEBHOOK_SECRET=your_webhook_signing_secret
```

2. Create or update the `vercel.json` file at the root of your project:

```json
{
  "functions": {
    "apps/web/app/api/stripe/webhooks/route.ts": {
      "includeFiles": "apps/web/app/api/stripe/webhooks/route.ts",
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "routes": [
    {
      "src": "/api/stripe/webhooks",
      "dest": "apps/web/app/api/stripe/webhooks/route.ts",
      "methods": ["POST"],
      "headers": {
        "Access-Control-Allow-Origin": "*"
      }
    }
  ]
}
```

### Option 3: Stripe CLI for Local Development

For local development, use the Stripe CLI to forward webhooks:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Forward webhooks locally: `stripe listen --forward-to localhost:3000/api/stripe/webhooks`

The CLI will provide a webhook secret you can use in your local environment.

## Debugging Webhook Issues

This application now includes enhanced debugging for webhook issues:

1. The webhook handler logs:

   - Full request headers
   - Request body length and a preview
   - Signature verification attempts

2. For persistent issues:
   - Check that the Stripe webhook secret matches what's in your Stripe Dashboard
   - Ensure the webhook URL is correct (https://yoursite.com/api/stripe/webhooks)
   - Verify that Vercel isn't modifying the request body in unexpected ways

## Security Considerations

The webhook handler now has fallback options for when verification fails, but in production, all webhooks should be properly verified. The fallback is only intended as a temporary solution while debugging issues.

For robust security:

1. Always use HTTPS
2. Keep your webhook secret secure
3. Never disable signature verification in production
4. Implement idempotency in your webhook handlers
