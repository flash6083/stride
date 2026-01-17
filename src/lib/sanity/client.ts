import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";


const projectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;

if (!projectId) {
    throw new Error("Missing EXPO_PUBLIC_SANITY_PROJECT_ID in .env.local");
}
// Client safe config
export const config = {
    projectId,
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
};

export const sanityClient = createClient(config);

// Admin level client used for backend
// Admin client for mutations
const adminConfig = {
    ...config,
    token: process.env.SANITY_API_TOKEN
};

export const sanityAdminClient = createClient(adminConfig);

// ✅ Image URL builder (modern API)
const builder = createImageUrlBuilder(config);

export const urlFor = (source: any) => {
    return builder.image(source);
};
