function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function httpsHost(value: string): string {
  const host = value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return `https://${host}`;
}

/**
 * Use the deployment's own URL for Vercel previews so canonical metadata,
 * robots, and sitemap links do not point at the production domain.
 */
export function getSiteUrl(): string {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return httpsHost(process.env.VERCEL_URL);
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return withoutTrailingSlash(configured);

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) return httpsHost(productionHost);

  const deploymentHost = process.env.VERCEL_URL;
  if (deploymentHost) return httpsHost(deploymentHost);

  return "http://localhost:3000";
}
