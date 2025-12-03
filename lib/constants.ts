// lib/constants.ts

export const RESERVED_USERNAMES = ['auth', 'dashboard', 'me', 'journal', 'grace-period', 'api', 'profile', 'not-found', 'logins', 'favicon.ico',];

export const DEFAULT_POST_LOGIN_REDIRECT = '/me';

export const LOCAL_STORAGE_USER_PROFILE_CACHE_KEY = 'whatcha_user_profile_cache_v1';

// Contact Information
export const AUTHOR_NAME = "Mohammed Hammaad";
export const AUTHOR_TWITTER_HANDLE = "@hammaadworks";
export const EMAIL = "hammaadworks@gmail.com";
export const WHATSAPP_PHONE_NUMBER = "8310428923";
export const WHATSAPP_MESSAGE = "Hey _hammaadworks_, I got here from your *whatcha-doin* app. Wazzup!";
export const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
export const X_PROFILE_URL = "https://x.com/hammaadworks";
export const GITHUB_PROFILE_URL = "https://github.com/hammaadworks";
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/hammaadworks";
export const PRODUCTHUNT_PROFILE_URL = "https://www.producthunt.com/@hammaadworks";
export const WEBSITE_URL = "https://www.hammaadworks.com";
export const DOMAIN_URL = "https://whatcha-doin.hammaadworks.com";
