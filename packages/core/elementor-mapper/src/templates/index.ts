import type { SectionTemplate } from '../types.js';
import { HEADER_TEMPLATE } from './header-hero.js';
import { HERO_TEMPLATE } from './header-hero.js';
import { ABOUT_TEMPLATE } from './content.js';
import { SERVICES_TEMPLATE } from './content.js';
import { PORTFOLIO_TEMPLATE } from './content.js';
import { TESTIMONIALS_TEMPLATE } from './content.js';
import { PRICING_TEMPLATE } from './content.js';
import { TEAM_TEMPLATE } from './content.js';
import { FAQ_TEMPLATE } from './content.js';
import { CONTACT_TEMPLATE } from './content.js';
import { FOOTER_TEMPLATE } from './footer-blog.js';
import { BLOG_POSTS_TEMPLATE } from './footer-blog.js';
import { SINGLE_POST_TEMPLATE } from './footer-blog.js';
import { SINGLE_PAGE_TEMPLATE } from './footer-blog.js';
import { PRODUCT_SINGLE_TEMPLATE } from './ecommerce.js';
import { PRODUCT_GRID_TEMPLATE } from './ecommerce.js';
import { CART_PAGE_TEMPLATE } from './ecommerce.js';
import { CHECKOUT_PAGE_TEMPLATE } from './ecommerce.js';
import { MY_ACCOUNT_TEMPLATE } from './ecommerce.js';
import { PURCHASE_SUMMARY_TEMPLATE } from './ecommerce.js';
import { LOGIN_PAGE_TEMPLATE } from './ecommerce.js';
import { CTA_BANNER_TEMPLATE } from './misc1.js';
import { COUNTDOWN_TEMPLATE } from './misc1.js';
import { FEATURES_TEMPLATE } from './misc1.js';
import { STATS_TEMPLATE } from './misc1.js';
import { VIDEO_TEMPLATE } from './misc1.js';
import { MEDIA_CAROUSEL_TEMPLATE } from './misc1.js';
import { TABLE_OF_CONTENTS_TEMPLATE } from './misc2.js';
import { SOCIAL_MEDIA_TEMPLATE } from './misc2.js';
import { TABS_SECTION_TEMPLATE } from './misc2.js';
import { MAPS_TEMPLATE } from './misc2.js';
import { ERROR_404_TEMPLATE } from './misc2.js';
import { SITEMAP_TEMPLATE } from './misc2.js';

export const SECTION_TEMPLATES: SectionTemplate[] = [
  HEADER_TEMPLATE,
  HERO_TEMPLATE,
  ABOUT_TEMPLATE,
  SERVICES_TEMPLATE,
  PORTFOLIO_TEMPLATE,
  TESTIMONIALS_TEMPLATE,
  PRICING_TEMPLATE,
  TEAM_TEMPLATE,
  FAQ_TEMPLATE,
  CONTACT_TEMPLATE,
  FOOTER_TEMPLATE,
  BLOG_POSTS_TEMPLATE,
  SINGLE_POST_TEMPLATE,
  SINGLE_PAGE_TEMPLATE,
  PRODUCT_SINGLE_TEMPLATE,
  PRODUCT_GRID_TEMPLATE,
  CART_PAGE_TEMPLATE,
  CHECKOUT_PAGE_TEMPLATE,
  MY_ACCOUNT_TEMPLATE,
  PURCHASE_SUMMARY_TEMPLATE,
  LOGIN_PAGE_TEMPLATE,
  CTA_BANNER_TEMPLATE,
  COUNTDOWN_TEMPLATE,
  FEATURES_TEMPLATE,
  STATS_TEMPLATE,
  VIDEO_TEMPLATE,
  MEDIA_CAROUSEL_TEMPLATE,
  TABLE_OF_CONTENTS_TEMPLATE,
  SOCIAL_MEDIA_TEMPLATE,
  TABS_SECTION_TEMPLATE,
  MAPS_TEMPLATE,
  ERROR_404_TEMPLATE,
  SITEMAP_TEMPLATE,
];

const PROJECT_TYPE_MAP: Record<string, string[]> = {
  corporate: ['business'],
  saas: ['business'],
  news: ['blog'],
};

export function getSectionTemplates(projectTypes?: string[]): SectionTemplate[] {
  if (!projectTypes || projectTypes.length === 0) {
    return SECTION_TEMPLATES;
  }
  const expanded = projectTypes.flatMap(pt => [pt, ...(PROJECT_TYPE_MAP[pt] || [])]).filter((v, i, a) => a.indexOf(v) === i);
  return SECTION_TEMPLATES.filter(t =>
    t.relevantFor.some(r => expanded.includes(r)),
  );
}

export function getSectionTemplate(key: string): SectionTemplate | undefined {
  return SECTION_TEMPLATES.find(t => t.key === key);
}
