import { getStore } from "@netlify/blobs";

export function getBlobStore(name) {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token =
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_BLOBS_TOKEN;

  if (siteID && token) return getStore({ name, siteID, token });
  return getStore(name);
}
