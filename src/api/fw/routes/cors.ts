export const buildCorsHeaders = (origin?: string) => {
    const allowOrigin = origin && origin.length > 0 ? origin : "*";
    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    };
};
