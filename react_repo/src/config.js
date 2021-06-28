const oktaAuthConfig = {
  // Note: If your app is configured to use the Implicit Flow
  // instead of the Authorization Code with Proof of Code Key Exchange (PKCE)
  // you will need to add `pkce: false`
  issuer: "https://dev-920484.okta.com/oauth2/default",
  clientId: "0oa2k04zh4y4Gcpaf4x7",
  redirectUri: window.location.origin + "/login-callback/",
};

const oktaSignInConfig = {
  baseUrl: "https://dev-920484.okta.com",
  clientId: "0oa2k04zh4y4Gcpaf4x7",
  redirectUri: window.location.origin + "/login-callback/",
  authParams: {
    // If your app is configured to use the Implicit Flow
    // instead of the Authorization Code with Proof of Code Key Exchange (PKCE)
    // you will need to uncomment the below line
    // pkce: false
  },
  features: { registration: true },
};

const stripe_publish_key =
  "pk_live_51HON5pAKG1Bl4DlQc1I00pS0btQDY811dmBsukImHEdHAsVAdVP4vYhgqosFlEzTMltdA1A0XuxfRcdiAJFHfGBg00JpRUnozb";

const freshchat_key = "23dfdd67-5ded-421d-8076-3948f18073cb";

export { oktaAuthConfig, oktaSignInConfig, stripe_publish_key, freshchat_key };
