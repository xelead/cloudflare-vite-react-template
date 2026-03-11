const fallback_app_name = "Cloudflare Vite React";

export const app_name = import.meta.env.VITE_APP_NAME?.trim() || fallback_app_name;
