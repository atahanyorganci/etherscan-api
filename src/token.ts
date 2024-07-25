import { z } from "zod";
import { Address } from "./core";

export const GetErc20BalanceParams = z.object({
	address: Address,
	contractAddress: Address,
});
export type GetErc20BalanceParams = z.infer<typeof GetErc20BalanceParams>;
