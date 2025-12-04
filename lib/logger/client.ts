'use client';

import pino from 'pino';

const logger = pino({
  browser: { asObject: true },
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export default logger;
