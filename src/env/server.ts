import { z } from "zod";

const serverEnvSchema = z.object({
    ETHERSCAN_API_KEY: z.string(),
});

const serverEnv = serverEnvSchema.parse({
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
});

export default serverEnv;
