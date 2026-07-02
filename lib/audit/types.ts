export type AuditStatus = "pass" | "warn" | "fail";

export type AuditCategory =
  | "security"
  | "performance"
  | "seo"
  | "mobile"
  | "technical";

export interface AuditCheck {
  id: string;
  label: string;
  status: AuditStatus;
  message: string;
  category: AuditCategory;
}

export interface AuditResult {
  url: string;
  score: number;
  checks: AuditCheck[];
  summary: string;
  auditedAt: string;
}

export interface PageFetchResult {
  html: string;
  status: number;
  responseTimeMs: number;
  pageSizeBytes: number;
  finalUrl: string;
  isHttps: boolean;
}

export interface ParsedPage {
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  htmlLang: string | null;
  hasViewport: boolean;
  ogTitle: boolean;
  ogDescription: boolean;
  ogImage: boolean;
  imagesTotal: number;
  imagesMissingAlt: number;
  hasFavicon: boolean;
}
