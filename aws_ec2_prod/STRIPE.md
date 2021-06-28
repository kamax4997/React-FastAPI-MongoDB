# Stripe

## Install

You must have [stripe-cli](https://stripe.com/docs/stripe-cli) installed, then:

```bash
pip install stripe
```

to test locally we need to run the stripe webhook
```bash
stripe login
```
```bash
stripe listen --forward-to 127.0.0.1:8000/stripe/stripe-webhook
```


