import type { Tool } from "ai";
import { z } from "zod";
import { format } from "date-fns";

export const dateTools: Record<string, Tool> = {
  "date-format": {
    description: "format timestamp to date or date-time string",
    parameters: z.object({
      timestamps: z.array(z.number()).describe("The timestamp list"),
      format: z.string().describe(`The date format, support list:
yyyy-MM (show year&month)
yyyy-MM-dd (show year&month&day)
yyyy-MM-dd HH:mm:ss (show year&month&day&hour&minute&second)
`),
    }),
    async execute(args) {
      return (args.timestamps || []).map((item) => ({
        timestamp: item,
        result: format(new Date(item), args.format),
      }));
    },
  },
};
