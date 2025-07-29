import type { Locale } from '~/config/i18n.config';

export interface AppMetadata {
  locale: Locale;
  title: string;
  shortTitle: string;
  description: string;
  logo: {
    href: string;
    maskable: boolean;
  };
  image: {
    href: string;
    alt: string;
  };
  twitter: {
    handle: string;
  };
}

export const metadata: Record<Locale, AppMetadata> = {
  en: {
    locale: 'en',
    title: 'AlgaeProBANOS',
    shortTitle: 'AlgaeProBANOS',
    description: '',
    logo: {
      href: '/assets/images/APB-logo-white.png',
      maskable: false,
    },
    image: {
      href: '/assets/images/APB-logo-white.png',
      alt: '',
    },
    twitter: {
      handle: 'AlgaeProBanos',
    },
  },
  de: {
    locale: 'de',
    title: 'AlgaeProBANOS',
    shortTitle: 'AlgaeProBANOS',
    description: '',
    logo: {
      href: '/assets/images/APB-logo-white.png',
      maskable: false,
    },
    image: {
      href: '/assets/images/APB-logo-white.png',
      alt: '',
    },
    twitter: {
      handle: 'AlgaeProBanos',
    },
  },
  nl: {
    locale: 'nl',
    title: 'AlgaeProBANOS',
    shortTitle: 'AlgaeProBANOS',
    description: '',
    logo: {
      href: '/assets/images/APB-logo-white.png',
      maskable: false,
    },
    image: {
      href: '/assets/images/APB-logo-white.png',
      alt: '',
    },
    twitter: {
      handle: 'AlgaeProBanos',
    },
  },
};

export const manifestFileName = 'site.webmanifest';
export const openGraphImageName = 'image.webp';
