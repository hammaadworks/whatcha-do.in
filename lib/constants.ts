/**
 * @fileoverview Application-wide constants and configuration values.
 * 
 * This file contains static values used across the application, including:
 * - Reserved routes and usernames
 * - Configuration for local storage keys
 * - Contact information and social media links
 * - UI/UX defaults
 */

export const SIMULATED_DATE_COOKIE = "simulated_date"
/**
 * List of usernames that cannot be registered by users as they conflict with application routes.
 */
export const RESERVED_USERNAMES = [
  'auth', 
  'dashboard', 
  'me', 
  'journal', 
  'grace-period', 
  'api', 
  'profile', 
  'not-found', 
  'logins', 
  'favicon.ico',
  'themes'
];

/**
 * The default route to redirect users to after a successful login.
 */
export const DEFAULT_POST_LOGIN_REDIRECT = '/me';

/**
 * Key used for caching user profile data in the browser's local storage.
 */
export const LOCAL_STORAGE_USER_PROFILE_CACHE_KEY = 'whatcha_user_profile_cache_v1';

// --- Contact & Author Information ---

/** The name of the application author. */
export const AUTHOR_NAME = "Mohammed Hammaad";

/** The author's Twitter/X handle. */
export const AUTHOR_TWITTER_HANDLE = "@hammaadworks";

/** The official support/contact email. */
export const EMAIL = "hammaadworks@gmail.com";

/** 
 * The main domain URL of the application.
 * Note: Switched from "https://whatcha-do.in" to the subdomain for current deployment.
 */
export const DOMAIN_URL = "https://whatcha-doin.hammaadworks.com";

/** WhatsApp contact number for support. */
export const WHATSAPP_PHONE_NUMBER = "8310428923";

/** Default message pre-filled when users contact via WhatsApp. */
export const WHATSAPP_MESSAGE = `Hey _hammaadworks_, I got here from your *${DOMAIN_URL}* app. Wazzup!`;

/** constructed WhatsApp API URL for deep linking. */
export const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

// --- Social Media Links ---

export const X_PROFILE_URL = "https://x.com/hammaadworks";
export const GITHUB_PROFILE_URL = "https://github.com/hammaadworks";
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/hammaadworks";
export const PRODUCTHUNT_PROFILE_URL = "https://www.producthunt.com/@hammaadworks";
export const WEBSITE_URL = "https://www.hammaadworks.com";

export const SEE_HOW_VID = "https://www.youtube.com/shorts/8LoehKZvbNc"
export const TUTORIAL_VID = "https://www.youtube.com/watch?v=R-0aUl0iQBg&list=PLWI_DJgO8kW8xVD0N4LyAFd6kAzJEbacx"

/** Custom protocol scheme for PWA deep linking. */
export const PWA_PROTOCOL = "web+whadoin";

// --- UI/UX Configuration ---

/** Number of activity log items to load per page/scroll. */
export const ACTIVITIES_PER_PAGE = 10;

/** Local storage key for persisting the folded state of the "Me" section. */
export const LOCAL_STORAGE_ME_FOLDED_KEY = 'whadoin_me_folded';

/** Local storage key for persisting the folded state of the "Actions" section. */
export const LOCAL_STORAGE_ACTIONS_FOLDED_KEY = 'whadoin_actions_folded';

/** Local storage key for persisting the folded state of the "Journal" section. */
export const LOCAL_STORAGE_JOURNAL_FOLDED_KEY = 'whadoin_journal_folded';

/** The required prefix for identity statements in the UI. */
export const IDENTITY_START_PHRASE = "I am";

/**
 * Predefined set of colors for Identities.
 * Uses Tailwind background classes.
 */
export const IDENTITY_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
  'bg-rose-500', 'bg-slate-500'
];