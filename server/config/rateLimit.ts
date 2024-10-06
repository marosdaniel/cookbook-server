import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 perc
  max: 150, // Max. 150 kérés egy IP-ről 10 perc alatt
  message: 'Too many requests from this IP, please try again later.',
  skip: req => {
    const ip = req.ip;
    // Ha az IP-cím localhost (IPv4: 127.0.0.1 vagy IPv6: ::1), akkor ne legyen limit
    return ip === '127.0.0.1' || ip === '::1';
  },
});
