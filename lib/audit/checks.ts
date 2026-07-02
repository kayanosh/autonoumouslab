import type {
  AuditCheck,
  AuditResult,
  PageFetchResult,
  ParsedPage,
} from "./types";

const MAX_PAGE_SIZE_BYTES = 2 * 1024 * 1024;

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /\.local$/i,
];

export function validateAuditUrl(input: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error("Please enter a valid website URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  if (parsed.port && !["80", "443", ""].includes(parsed.port)) {
    throw new Error("Only standard web ports are allowed.");
  }

  const hostname = parsed.hostname.replace(/^\[/, "").replace(/\]$/, "");

  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new Error("This URL cannot be audited.");
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    const parts = hostname.split(".").map(Number);
    const [a, b] = parts;
    if (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0
    ) {
      throw new Error("This URL cannot be audited.");
    }
  }

  return parsed;
}

export async function fetchPage(url: URL): Promise<PageFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const start = Date.now();

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "AutoLabs-AuditBot/1.0 (+https://autolabs.co.uk; website audit tool)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const responseTimeMs = Date.now() - start;
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error("This URL did not return an HTML page.");
    }

    const buffer = await response.arrayBuffer();
    const pageSizeBytes = buffer.byteLength;

    if (pageSizeBytes > MAX_PAGE_SIZE_BYTES) {
      throw new Error("Page is too large to audit.");
    }

    const html = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    const finalUrl = response.url;
    const isHttps = finalUrl.startsWith("https://");

    return {
      html,
      status: response.status,
      responseTimeMs,
      pageSizeBytes,
      finalUrl,
      isHttps,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The website took too long to respond.");
    }
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error("We couldn't reach that website. Check the URL and try again.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRobotsTxt(origin: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${origin}/robots.txt`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AutoLabs-AuditBot/1.0",
      },
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function parsePage(html: string): ParsedPage {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/\s+/g, " ")) : null;

  const metaDescMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  ) || html.match(
    /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
  );
  const metaDescription = metaDescMatch ? decodeHtmlEntities(metaDescMatch[1]) : null;

  const h1Matches = html.match(/<h1[\s>]/gi);
  const h1Count = h1Matches ? h1Matches.length : 0;

  const htmlLangMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  const htmlLang = htmlLangMatch ? htmlLangMatch[1] : null;

  const hasViewport =
    /<meta[^>]+name=["']viewport["']/i.test(html) ||
    /<meta[^>]+content=[^>]+width=device-width/i.test(html);

  const ogTitle =
    /<meta[^>]+property=["']og:title["']/i.test(html) ||
    /<meta[^>]+name=["']og:title["']/i.test(html);

  const ogDescription =
    /<meta[^>]+property=["']og:description["']/i.test(html) ||
    /<meta[^>]+name=["']og:description["']/i.test(html);

  const ogImage =
    /<meta[^>]+property=["']og:image["']/i.test(html) ||
    /<meta[^>]+name=["']og:image["']/i.test(html);

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  let imagesMissingAlt = 0;
  for (const tag of imgTags) {
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    if (!altMatch || altMatch[1].trim() === "") {
      imagesMissingAlt++;
    }
  }

  const hasFavicon =
    /<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i.test(html);

  return {
    title,
    metaDescription,
    h1Count,
    htmlLang,
    hasViewport,
    ogTitle,
    ogDescription,
    ogImage,
    imagesTotal: imgTags.length,
    imagesMissingAlt,
    hasFavicon,
  };
}

function check(
  id: string,
  label: string,
  status: AuditCheck["status"],
  message: string,
  category: AuditCheck["category"]
): AuditCheck {
  return { id, label, status, message, category };
}

export function runChecks(
  fetchResult: PageFetchResult,
  parsed: ParsedPage,
  robotsTxtOk: boolean
): AuditCheck[] {
  const checks: AuditCheck[] = [];

  checks.push(
    check(
      "https",
      "HTTPS",
      fetchResult.isHttps ? "pass" : "fail",
      fetchResult.isHttps
        ? "Your site uses a secure HTTPS connection."
        : "Your site is not served over HTTPS. Browsers flag this as insecure.",
      "security"
    )
  );

  checks.push(
    check(
      "status",
      "Page availability",
      fetchResult.status === 200 ? "pass" : fetchResult.status >= 400 ? "fail" : "warn",
      fetchResult.status === 200
        ? "The page loaded successfully."
        : `The server returned HTTP ${fetchResult.status}.`,
      "security"
    )
  );

  let responseStatus: AuditCheck["status"] = "fail";
  if (fetchResult.responseTimeMs < 2000) responseStatus = "pass";
  else if (fetchResult.responseTimeMs < 4000) responseStatus = "warn";

  checks.push(
    check(
      "response-time",
      "Load time",
      responseStatus,
      responseStatus === "pass"
        ? `Page responded in ${(fetchResult.responseTimeMs / 1000).toFixed(1)}s — fast.`
        : responseStatus === "warn"
          ? `Page took ${(fetchResult.responseTimeMs / 1000).toFixed(1)}s to respond — could be faster.`
          : `Page took ${(fetchResult.responseTimeMs / 1000).toFixed(1)}s to respond — too slow.`,
      "performance"
    )
  );

  const sizeKb = fetchResult.pageSizeBytes / 1024;
  let sizeStatus: AuditCheck["status"] = "pass";
  if (sizeKb > 500) sizeStatus = "warn";
  if (sizeKb > 1500) sizeStatus = "fail";

  checks.push(
    check(
      "page-size",
      "Page size",
      sizeStatus,
      sizeStatus === "pass"
        ? `HTML page size is ${Math.round(sizeKb)}KB — reasonable.`
        : sizeStatus === "warn"
          ? `HTML page size is ${Math.round(sizeKb)}KB — on the heavy side.`
          : `HTML page size is ${Math.round(sizeKb)}KB — very heavy.`,
      "performance"
    )
  );

  if (!parsed.title) {
    checks.push(
      check(
        "title",
        "Page title",
        "fail",
        "No <title> tag found. Search engines need this to understand your page.",
        "seo"
      )
    );
  } else {
    const len = parsed.title.length;
    let titleStatus: AuditCheck["status"] = "pass";
    if (len < 30 || len > 60) titleStatus = "warn";
    checks.push(
      check(
        "title",
        "Page title",
        titleStatus,
        titleStatus === "pass"
          ? `Title is ${len} characters — good length for SEO.`
          : len < 30
            ? `Title is only ${len} characters — aim for 30–60.`
            : `Title is ${len} characters — aim for 30–60.`,
        "seo"
      )
    );
  }

  if (!parsed.metaDescription) {
    checks.push(
      check(
        "meta-description",
        "Meta description",
        "fail",
        "No meta description found. This hurts click-through rates in search results.",
        "seo"
      )
    );
  } else {
    const len = parsed.metaDescription.length;
    let descStatus: AuditCheck["status"] = "pass";
    if (len < 120 || len > 160) descStatus = "warn";
    checks.push(
      check(
        "meta-description",
        "Meta description",
        descStatus,
        descStatus === "pass"
          ? `Meta description is ${len} characters — good length.`
          : len < 120
            ? `Meta description is ${len} characters — aim for 120–160.`
            : `Meta description is ${len} characters — aim for 120–160.`,
        "seo"
      )
    );
  }

  if (parsed.h1Count === 0) {
    checks.push(
      check(
        "h1",
        "H1 heading",
        "fail",
        "No H1 heading found. Every page should have exactly one clear H1.",
        "seo"
      )
    );
  } else if (parsed.h1Count === 1) {
    checks.push(
      check(
        "h1",
        "H1 heading",
        "pass",
        "Exactly one H1 heading found — good structure.",
        "seo"
      )
    );
  } else {
    checks.push(
      check(
        "h1",
        "H1 heading",
        "warn",
        `${parsed.h1Count} H1 headings found. Use exactly one per page.`,
        "seo"
      )
    );
  }

  checks.push(
    check(
      "html-lang",
      "Language attribute",
      parsed.htmlLang ? "pass" : "warn",
      parsed.htmlLang
        ? `Language set to "${parsed.htmlLang}".`
        : "No lang attribute on <html>. Helps accessibility and SEO.",
      "seo"
    )
  );

  const ogCount = [parsed.ogTitle, parsed.ogDescription, parsed.ogImage].filter(Boolean).length;
  checks.push(
    check(
      "open-graph",
      "Open Graph tags",
      ogCount === 3 ? "pass" : ogCount >= 1 ? "warn" : "fail",
      ogCount === 3
        ? "All key Open Graph tags are present for social sharing."
        : ogCount >= 1
          ? `${ogCount}/3 Open Graph tags found. Add og:title, og:description, and og:image.`
          : "No Open Graph tags found. Links won't preview well on social media.",
      "seo"
    )
  );

  checks.push(
    check(
      "viewport",
      "Mobile viewport",
      parsed.hasViewport ? "pass" : "fail",
      parsed.hasViewport
        ? "Viewport meta tag is set — mobile-friendly."
        : "No viewport meta tag. Your site may not display correctly on phones.",
      "mobile"
    )
  );

  if (parsed.imagesTotal === 0) {
    checks.push(
      check(
        "image-alt",
        "Image alt text",
        "pass",
        "No images found on the page.",
        "mobile"
      )
    );
  } else if (parsed.imagesMissingAlt === 0) {
    checks.push(
      check(
        "image-alt",
        "Image alt text",
        "pass",
        `All ${parsed.imagesTotal} images have alt text.`,
        "mobile"
      )
    );
  } else {
    const ratio = parsed.imagesMissingAlt / parsed.imagesTotal;
    checks.push(
      check(
        "image-alt",
        "Image alt text",
        ratio > 0.5 ? "fail" : "warn",
        `${parsed.imagesMissingAlt} of ${parsed.imagesTotal} images are missing alt text.`,
        "mobile"
      )
    );
  }

  checks.push(
    check(
      "robots-txt",
      "robots.txt",
      robotsTxtOk ? "pass" : "warn",
      robotsTxtOk
        ? "robots.txt is accessible."
        : "No robots.txt found. Search engines may not crawl your site optimally.",
      "technical"
    )
  );

  checks.push(
    check(
      "favicon",
      "Favicon",
      parsed.hasFavicon ? "pass" : "warn",
      parsed.hasFavicon
        ? "Favicon is linked in the page."
        : "No favicon detected. Your site tab will look generic in browsers.",
      "technical"
    )
  );

  return checks;
}

export function calculateScore(checks: AuditCheck[]): number {
  if (checks.length === 0) return 0;

  const total = checks.reduce((sum, item) => {
    if (item.status === "pass") return sum + 100;
    if (item.status === "warn") return sum + 50;
    return sum;
  }, 0);

  return Math.round(total / checks.length);
}

export function buildSummary(url: string, score: number, checks: AuditCheck[]): string {
  const issues = checks.filter((item) => item.status !== "pass");
  const lines = [
    `Website audit for ${url}`,
    `Overall score: ${score}/100`,
    "",
  ];

  if (issues.length === 0) {
    lines.push("All checks passed.");
  } else {
    lines.push("Issues found:");
    for (const item of issues) {
      lines.push(`- [${item.status.toUpperCase()}] ${item.label}: ${item.message}`);
    }
  }

  return lines.join("\n");
}

export async function auditWebsite(inputUrl: string): Promise<AuditResult> {
  const url = validateAuditUrl(inputUrl);
  const fetchResult = await fetchPage(url);
  const parsed = parsePage(fetchResult.html);
  const origin = new URL(fetchResult.finalUrl).origin;
  const robotsTxtOk = await fetchRobotsTxt(origin);
  const checks = runChecks(fetchResult, parsed, robotsTxtOk);
  const score = calculateScore(checks);

  return {
    url: fetchResult.finalUrl,
    score,
    checks,
    summary: buildSummary(fetchResult.finalUrl, score, checks),
    auditedAt: new Date().toISOString(),
  };
}
