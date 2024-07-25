import { z } from "zod";
import { DateString, Ether, Integer, TimeStamp, Wei } from "./core";

export const Ether2Supply = z
	.object({
		EthSupply: Wei,
		Eth2Staking: Wei,
		BurntFees: Wei,
		WithdrawnTotal: Wei,
	})
	.transform(
		({
			EthSupply: etherSupply,
			Eth2Staking: stakingRewards,
			BurntFees: burntFees,
			WithdrawnTotal: withdrawnTotal,
		}) => ({
			etherSupply,
			stakingRewards,
			burntFees,
			withdrawnTotal,
		}),
	);
export type Ether2Supply = z.infer<typeof Ether2Supply>;

export const EtherPriceResponse = z
	.object({
		ethbtc: Ether,
		ethbtc_timestamp: TimeStamp,
		ethusd: Ether,
		ethusd_timestamp: TimeStamp,
	})
	.transform(
		({
			ethbtc: eth2btc,
			ethbtc_timestamp: eth2btcTimeStamp,
			ethusd: eth2usd,
			ethusd_timestamp: eth2usdTimeStamp,
		}) => ({
			eth2btc,
			eth2btcTimeStamp,
			eth2usd,
			eth2usdTimeStamp,
		}),
	);
export type EtherPriceResponse = z.infer<typeof EtherPriceResponse>;

export const GetEthereumNodeSizeParams = z.object({
	startDate: DateString,
	endDate: DateString,
	clientType: z.enum(["geth", "parity"]),
	syncMode: z.enum(["default", "archive"]),
	sort: z.enum(["asc", "desc"]),
});
export type GetEthereumNodeSizeParams = z.infer<typeof GetEthereumNodeSizeParams>;

export const EthereumNodeSize = z.object({
	blockNumber: Integer,
	chainTimeStamp: DateString.transform(date => Math.floor(new Date(date).getTime() / 1000)),
	chainSize: Integer,
	clientType: z.enum(["Geth", "Parity"]),
	syncMode: z.enum(["Default", "Archive"]),
});
export type EthereumNodeSize = z.infer<typeof EthereumNodeSize>;

export const GetEthereumNodesSizeResponse = z.array(EthereumNodeSize);
export type GetEthereumNodesSizeResponse = z.infer<typeof GetEthereumNodesSizeResponse>;

export const NodeCountResponse = z
	.object({
		UTCDate: DateString.transform(date => Math.floor(new Date(date).getTime() / 1000)),
		TotalNodeCount: Integer,
	})
	.transform(({ UTCDate: timestamp, TotalNodeCount: count }) => ({
		timestamp,
		count,
	}));
