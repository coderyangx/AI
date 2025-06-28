import Lion from "@dp/lion-client";

const CONFIG: Map<string, string> = new Map();

export const initConfig = async () => {
  try {
    const value = await Lion.getProperty(
      "com.sankuai.oa.kuaida.agent.FRIDAY_API_KEY",
      ""
    );

    CONFIG.set("FRIDAY_API_KEY", value);
    process.env.FRIDAY_API_KEY = value;
  } catch {
    // ignore
  }
};

export const getConfig = (key: string) => {
  return CONFIG.get(key);
};
