export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdn.jsdelivr.net',
        'https://embeddable-sandbox.cdn.apollographql.com',
      ],
      connectSrc: [
        "'self'",
        'http://localhost:8080',
        'https://sandbox.apollo.dev',
        'https://embeddable-sandbox.cdn.apollographql.com',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https://cdn.jsdelivr.net',
        'https://embeddable-sandbox.cdn.apollographql.com',
        'https://apollo-server-landing-page.cdn.apollographql.com',
      ],
      frameSrc: ["'self'", 'https://sandbox.embed.apollographql.com'],
      manifestSrc: ["'self'", 'https://apollo-server-landing-page.cdn.apollographql.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    },
  },
};
