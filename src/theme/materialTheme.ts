/**
 * Material Design 3 (Material You) Theme Presets for Sổ Thiệp Mời
 * Inspired by Google style guidelines but with a distinct domestic family identity.
 */

export interface ColorPair {
  bg: string;
  border: string;
  text: string;
  subtext: string;
  iconBg: string;
  accent: string;
}

export const PASTEL_THEMES: ColorPair[] = [
  {
    // Peach / Soft Orange
    bg: 'bg-orange-100/70 dark:bg-orange-950/20',
    border: 'border-orange-200/80 dark:border-orange-900/30',
    text: 'text-black dark:text-white',
    subtext: 'text-black/80 dark:text-slate-300',
    iconBg: 'bg-orange-200/60 dark:bg-orange-950/40',
    accent: '#EA580C'
  },
  {
    // Lavender / Soft Purple
    bg: 'bg-purple-100/70 dark:bg-purple-950/20',
    border: 'border-purple-200/80 dark:border-purple-900/30',
    text: 'text-black dark:text-white',
    subtext: 'text-black/80 dark:text-slate-300',
    iconBg: 'bg-purple-200/60 dark:bg-purple-950/40',
    accent: '#9333EA'
  },
  {
    // Soft Blue
    bg: 'bg-blue-100/70 dark:bg-blue-950/20',
    border: 'border-blue-200/80 dark:border-blue-900/30',
    text: 'text-black dark:text-white',
    subtext: 'text-black/80 dark:text-slate-300',
    iconBg: 'bg-blue-200/60 dark:bg-blue-950/40',
    accent: '#2563EB'
  },
  {
    // Soft Green / Mint
    bg: 'bg-emerald-100/70 dark:bg-emerald-950/20',
    border: 'border-emerald-200/80 dark:border-emerald-900/30',
    text: 'text-black dark:text-white',
    subtext: 'text-black/80 dark:text-slate-300',
    iconBg: 'bg-emerald-200/60 dark:bg-emerald-950/40',
    accent: '#16A34A'
  },
  {
    // Soft Yellow / Corn
    bg: 'bg-amber-100/70 dark:bg-amber-950/20',
    border: 'border-amber-200/80 dark:border-amber-900/30',
    text: 'text-black dark:text-white',
    subtext: 'text-black/80 dark:text-slate-300',
    iconBg: 'bg-amber-200/60 dark:bg-amber-950/40',
    accent: '#D97706'
  },
  {
    // Soft Rose
    bg: 'bg-rose-100/70 dark:bg-rose-950/20',
    border: 'border-rose-200/80 dark:border-rose-900/30',
    text: 'text-black dark:text-white',
    subtext: 'text-black/80 dark:text-slate-300',
    iconBg: 'bg-rose-200/60 dark:bg-rose-950/40',
    accent: '#E11D48'
  }
];

export function getPastelTheme(index: number): ColorPair {
  return PASTEL_THEMES[index % PASTEL_THEMES.length];
}

export const MATERIAL_THEME_CLASSES = {
  // Rounded corners according to spec
  card: 'rounded-[24px] backdrop-blur-xl saturate-150',
  button: 'rounded-[24px] transition-all active:scale-[0.97] duration-300',
  avatar: 'rounded-full',
  
  // Custom subtle shadows as per spec: 0 2px 12px rgba(0,0,0,0.05)
  subtleShadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.02)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.25)]',
  
  // Divider
  divider: 'border-slate-200/40 dark:border-white/5'
};
