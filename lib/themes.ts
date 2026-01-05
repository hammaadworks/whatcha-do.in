export type UnlockCondition = 'free' | 'payment' | 'social';
export type SocialPlatform = 'twitter_post' | 'twitter_follow' | 'github_follow' | 'instagram_follow' | 'youtube_sub';

export interface ThemeOption {
    id: string; // Changed from BrandTheme to string to avoid circular dependency
    name: string;
    description: string;
    colors: {
        background: string;
        foreground: string;
        card: string;
        cardForeground: string;
        popover: string;
        popoverForeground: string;
        primary: string;
        primaryForeground: string;
        secondary: string;
        secondaryForeground: string;
        muted: string;
        mutedForeground: string;
        accent: string;
        accentForeground: string;
        destructive: string;
        destructiveForeground: string;
        border: string;
        input: string;
        ring: string;
        sidebar: string;
        sidebarForeground: string;
        sidebarPrimary: string;
        sidebarPrimaryForeground: string;
        sidebarAccent: string;
        sidebarAccentForeground: string;
        sidebarBorder: string;
        sidebarRing: string;
    };
    isPro: boolean;
    unlockCondition: UnlockCondition;
    price?: number; // In cents
    socialPlatform?: SocialPlatform;
    baseMode: 'light' | 'dark'; // New property for auto-mode switching
}

export const THEMES: ThemeOption[] = [
    {
        id: "river",
        name: "River",
        description: "A cool, calming river-inspired theme for focused work.",
        colors: {
            background: "#e8f0f0",
            foreground: "#0a4a55",
            card: "#f2f7f7",
            cardForeground: "#0a4a55",
            popover: "#f2f7f7",
            popoverForeground: "#0a4a55",
            primary: "#06858e",
            primaryForeground: "#ffffff",
            secondary: "#d9eaea",
            secondaryForeground: "#0a4a55",
            muted: "#e0eaea",
            mutedForeground: "#427a7e",
            accent: "#c9e5e7",
            accentForeground: "#0a4a55",
            destructive: "#d13838",
            destructiveForeground: "#ffffff",
            border: "#cde0e2",
            input: "#d9eaea",
            ring: "#06858e",
            sidebar: "#daebed",
            sidebarForeground: "#0a4a55",
            sidebarPrimary: "#06858e",
            sidebarPrimaryForeground: "#ffffff",
            sidebarAccent: "#c9e5e7",
            sidebarAccentForeground: "#0a4a55",
            sidebarBorder: "#cde0e2",
            sidebarRing: "#06858e",
        },
        isPro: false,
        unlockCondition: 'free',
        baseMode: 'light',
    },
    {
        id: "monolith",
        name: "Monolith",
        description: "A sharp, professional, and minimalist dark theme. Projects discipline and focus.",
        colors: {
            background: "#161616",
            foreground: "#E0E0E0",
            card: "#222222",
            cardForeground: "#E0E0E0",
            popover: "#161616",
            popoverForeground: "#E0E0E0",
            primary: "#00F5A0",
            primaryForeground: "#000000",
            secondary: "#2a2a2a",
            secondaryForeground: "#CCCCCC",
            muted: "#2a2a2a",
            mutedForeground: "#CCCCCC",
            accent: "#00F5A0",
            accentForeground: "#000000",
            destructive: "#FF4757",
            destructiveForeground: "#FFFFFF",
            border: "#3A3A3A",
            input: "#3A3A3A",
            ring: "#00F5A0",
            sidebar: "#222222",
            sidebarForeground: "#E0E0E0",
            sidebarPrimary: "#00F5A0",
            sidebarPrimaryForeground: "#000000",
            sidebarAccent: "#2a2a2a",
            sidebarAccentForeground: "#CCCCCC",
            sidebarBorder: "#3A3A3A",
            sidebarRing: "#00F5A0",
        },
        isPro: false,
        unlockCondition: 'free',
        baseMode: 'dark',
    },
    {
        id: "darky",
        name: "Darky",
        description: "A deep, navy-blue inspired dark theme for late night hackers.",
        colors: {
            background: "#181a24",
            foreground: "#e6eaf3",
            card: "#23243a",
            cardForeground: "#e6eaf3",
            popover: "#23243a",
            popoverForeground: "#ffe066",
            primary: "#3a5ba0",
            primaryForeground: "#ffe066",
            secondary: "#ffe066",
            secondaryForeground: "#23243a",
            muted: "#1d1e2f",
            mutedForeground: "#7a88a1",
            accent: "#bccdf0",
            accentForeground: "#181a24",
            destructive: "#a04a6c",
            destructiveForeground: "#ffe066",
            border: "#2d2e3e",
            input: "#3a5ba0",
            ring: "#ffe066",
            sidebar: "#23243a",
            sidebarForeground: "#e6eaf3",
            sidebarPrimary: "#3a5ba0",
            sidebarPrimaryForeground: "#ffe066",
            sidebarAccent: "#ffe066",
            sidebarAccentForeground: "#23243a",
            sidebarBorder: "#2d2e3e",
            sidebarRing: "#ffe066",
        },
        isPro: true,
        unlockCondition: 'social',
        socialPlatform: 'twitter_post',
        baseMode: 'dark',
    },
    {
        id: "prototype",
        name: "Prototype",
        description: "A raw, wireframe-like aesthetic with playful colors.",
        colors: {
            background: "#f6e6ee",
            foreground: "#5b5b5b",
            card: "#fdedc9",
            cardForeground: "#5b5b5b",
            popover: "#ffffff",
            popoverForeground: "#5b5b5b",
            primary: "#d04f99",
            primaryForeground: "#ffffff",
            secondary: "#8acfd1",
            secondaryForeground: "#333333",
            muted: "#b2e1eb",
            mutedForeground: "#7a7a7a",
            accent: "#fbe2a7",
            accentForeground: "#333333",
            destructive: "#f96f70",
            destructiveForeground: "#ffffff",
            border: "#d04f99",
            input: "#e4e4e4",
            ring: "#e670ab",
            sidebar: "#f8d8ea",
            sidebarForeground: "#333333",
            sidebarPrimary: "#ec4899",
            sidebarPrimaryForeground: "#ffffff",
            sidebarAccent: "#f9a8d4",
            sidebarAccentForeground: "#333333",
            sidebarBorder: "#f3e8ff",
            sidebarRing: "#ec4899",
        },
        isPro: true,
        unlockCondition: 'social',
        socialPlatform: 'youtube_sub',
        price: 500, // Price kept just in case but overridden by social condition
        baseMode: 'light',
    },
    {
        id: "zenith",
        name: "Zenith",
        description: "A bright, clean, and energetic theme with soft, motivational pastel gradients.",
        colors: {
            background: "#FFFFFF",
            foreground: "#212529",
            card: "#F8F9FA",
            cardForeground: "#212529",
            popover: "#FFFFFF",
            popoverForeground: "#212529",
            primary: "#FF6B6B",
            primaryForeground: "#FFFFFF",
            secondary: "#F1F3F5",
            secondaryForeground: "#495057",
            muted: "#F1F3F5",
            mutedForeground: "#495057",
            accent: "#FF6B6B",
            accentForeground: "#FFFFFF",
            destructive: "#DC3545",
            destructiveForeground: "#FFFFFF",
            border: "#DEE2E6",
            input: "#DEE2E6",
            ring: "#FF6B6B",
            sidebar: "#FFFFFF",
            sidebarForeground: "#212529",
            sidebarPrimary: "#FF6B6B",
            sidebarPrimaryForeground: "#FFFFFF",
            sidebarAccent: "#F1F3F5",
            sidebarAccentForeground: "#495057",
            sidebarBorder: "#DEE2E6",
            sidebarRing: "#FF6B6B",
        },
        isPro: true,
        unlockCondition: 'payment',
        price: 500,
        baseMode: 'dark',
    },
];

// Dynamically derive the BrandTheme type and IDs from the configuration
export const THEME_IDS = THEMES.map(t => t.id);
export type BrandTheme = string;