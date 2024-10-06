import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, // Max. 100 requests per 15 minutes from the same IP
  message: 'Too many requests from this IP, please try again later.',
});
