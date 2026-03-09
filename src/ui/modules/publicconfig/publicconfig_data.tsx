import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { PublicConfig } from "@src/ui/modules/publicconfig/publicconfig_types.ts";

type PublicConfigContextValue = {
	data: PublicConfig;
};

const PublicConfigContext = createContext<PublicConfigContextValue>({
	data: {},
});

async function load_public_config(): Promise<PublicConfig> {
	try {
		const response = await fetch("/api/publicconfig", {
			headers: { Accept: "application/json" },
		});
		if (!response.ok) return {};

		const payload = await response.json();
		return typeof payload === "object" && payload ? (payload as PublicConfig) : {};
	} catch {
		return {};
	}
}

export function PublicConfigProvider({ children }: { children: ReactNode }) {
	const [data, setData] = useState<PublicConfig>({});

	useEffect(() => {
		let is_active = true;

		void load_public_config().then((config) => {
			if (is_active) setData(config);
		});

		return () => {
			is_active = false;
		};
	}, []);

	return (
		<PublicConfigContext.Provider value={{ data }}>
			{children}
		</PublicConfigContext.Provider>
	);
}

export function usePublicConfigData() {
	return useContext(PublicConfigContext);
}
