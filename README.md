# GirlUp - Grant a Wish

GirlUp VITC - Grant a Wish

To start the server, run

```
npm run start
```

The application can be configured with the following options in `config.json`:

- `PORT`: (optional) The port number the app listens on.
- `ADMINS`: A list of e-mail addresses the application treats as admins.
- `GOAUTH_CLIENT_SECRET`*: The Google OAuth client secret the app will use for
  authentication.
- `GOAUTH_CLIENT_ID`*: The Google OAuth ID the app will use for authentication.
- `GOAUTH_REDIRECT_URI`: Should be set to `&lt;hosting_url&gt;/auth/google`.
- `SECRET`: The string to use as the session signing secret.
- `RAZORPAY_KEY_ID`: Should be set to the value obtained from the Razorpay
  dashboard.
- `RAZORPAY_KEY_SECRET`: Should be set to the value obtained from the Razorpay
  dashboard.

*These can be obtained from the Google Cloud dashboard.
