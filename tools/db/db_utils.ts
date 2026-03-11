import {getEnvBoolean} from "../../src/api/fw/config/env_helpers";

// Fix mongodb connection isssue:
// Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.dx5sdwn.mongodb.net
// at QueryReqWrap.onresolve [as oncomplete] (node:internal/dns/promises:294:17) {
//     errno: undefined,
//         code: 'ECONNREFUSED',
//         syscall: 'querySrv',
//         hostname: '_mongodb._tcp.cluster0.dx5sdwn.mongodb.net
export async function apply_public_dns_servers(): Promise<void> {

    const use_public_dns = await getEnvBoolean("FORCE_PUBLIC_DNS");
    if (!use_public_dns) {
        return
    }
    console.log("Using public DNS servers for MongoDB connection.");

    try {
        const dns = await import("dns");
        dns.setServers(["1.1.1.1", "8.8.8.8"]);
        return;
    } catch {
        console.warn(
            "FORCE_PUBLIC_DNS is enabled, but DNS APIs are unavailable in this runtime.",
        );
    }
}
