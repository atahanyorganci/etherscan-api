import { ofetch } from "ofetch";
import type { Storage } from "unstorage";
import { getAddress, InvalidAddressError, parseEther } from "viem";
import { z } from "zod";

type Primitive = boolean | string | number | undefined | null;

/**
 * Boolean represented as a string `"0"` or `"1"`
 */
export const EnumBoolean = z.enum(["0", "1"]).transform(value => value === "1");

/**
 * Optional string represented as an empty string `""` or a non-empty string
 */
export const OptionalString = z.string().transform(value => (value === "" ? undefined : value));

/**
 * Address hex-strings `0x` prefix followed by 40 hexadecimal characters
 */
export const Address = z.string().transform((value, ctx) => {
	try {
		return getAddress(value);
	} catch (error) {
		if (error instanceof InvalidAddressError) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: error.message,
			});
		}
		return z.NEVER;
	}
});

/**
 * Address represented as a string with a `0x` prefix followed by 40 hexadecimal characters or an empty string
 */
export const OptionalAddress = Address.or(OptionalString);

/**
 * Ether value with 18 decimal places represented as a string
 *
 * @example `"1.0"` is parsed as  `1000000000000000000n` wei
 */
export const Ether = z.string().transform(ether => parseEther(ether));
export type Ether = z.infer<typeof Ether>;

/**
 * Hexadecimal value represented as a string with a `0x` prefix followed by an even number of hexadecimal characters
 * if string is only `0x` then it is parsed as `undefined`
 */
export const HexValue = z
	.string()
	.refine(value => value.match(/^0x[0-9a-fA-F]*$/i))
	.transform(value => (value.length === 2 ? undefined : value));
export type HexValue = z.infer<typeof HexValue>;

/**
 * Hexadecimal string represented as a string with a `0x` prefix followed by an even number of hexadecimal characters
 */
export const HexString = z.string().refine(value => value.match(/^0x[0-9a-fA-F]*$/i));
export type HexString = z.infer<typeof HexString>;

/**
 * Unix timestamp represented as a number of seconds since the Unix epoch
 */
const TimeStamp = z.coerce.number().transform(value => new Date(value * 1000));

/**
 * Integer string represented as a string of digits
 */
const Integer = z.coerce.number().int();

/**
 * Big integer represented as a string of digits
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: this symbol isn't exported and connivent
const BigInt = z.coerce.bigint();

const SuccessResponse = z.object({
	status: z.literal("1"),
	message: z.string(),
	result: z.unknown(),
});

const ErrorResponse = z.object({
	status: z.literal("0"),
	message: z.string(),
	result: z.string(),
});

const Response = z.discriminatedUnion("status", [SuccessResponse, ErrorResponse]);
type Response = z.infer<typeof Response>;

type EndpointParams = { module: string; action: string } & Record<string, Primitive>;

const BalanceOptions = z.object({
	tag: z.enum(["latest", "earliest", "pending"]).optional(),
});
export type BalanceOptions = z.infer<typeof BalanceOptions>;

const GetBalancesInput = Address.or(z.array(Address).max(20)).transform(value => {
	if (Array.isArray(value)) {
		return value;
	}
	return [value];
});
const GetBalancesResult = z.array(z.object({ account: Address, balance: Ether }));

const PaginationOptions = z.object({
	startBlock: Integer.min(0).optional(),
	endBlock: Integer.min(0).optional(),
	page: Integer.min(1).optional(),
	offset: Integer.min(1).max(10000).optional(),
	sort: z.enum(["asc", "desc"]).optional(),
});
export type PaginationOptions = Partial<z.infer<typeof PaginationOptions>>;

const LogPaginationOptions = z.object({
	fromBlock: Integer.min(0).optional(),
	toBlock: Integer.min(0).optional(),
	page: Integer.min(1).optional(),
	offset: Integer.min(1).max(10000).optional(),
});
export type LogPaginationOptions = Partial<z.infer<typeof LogPaginationOptions>>;

const Transaction = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	hash: z.string(),
	nonce: Integer,
	blockHash: z.string(),
	transactionIndex: Integer,
	from: Address,
	to: OptionalAddress,
	value: Ether,
	gas: BigInt,
	gasPrice: BigInt,
	isError: EnumBoolean,
	txreceipt_status: EnumBoolean,
	input: HexValue,
	contractAddress: OptionalAddress,
	cumulativeGasUsed: BigInt,
	gasUsed: BigInt,
	confirmations: Integer,
	methodId: HexValue,
	functionName: OptionalString,
});
export type Transaction = z.infer<typeof Transaction>;

const InternalTransaction = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	hash: z.string(),
	from: Address,
	to: OptionalAddress,
	value: Ether,
	contractAddress: OptionalAddress,
	input: OptionalString.or(HexValue),
	type: z.enum(["call", "create"]),
	gas: BigInt,
	gasUsed: BigInt,
	traceId: z.string(),
	isError: EnumBoolean,
	errCode: OptionalString,
});

const InternalTransactionByHash = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	from: Address,
	to: OptionalAddress,
	value: Ether,
	contractAddress: OptionalAddress,
	input: OptionalString.or(HexValue),
	type: z.enum(["call", "create"]),
	gas: BigInt,
	gasUsed: BigInt,
	isError: EnumBoolean,
	errCode: OptionalString,
});

const ERC20TokenTransfer = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	hash: z.string(),
	nonce: Integer,
	blockHash: z.string(),
	from: Address,
	contractAddress: Address,
	to: Address,
	value: Ether,
	tokenName: z.string(),
	tokenSymbol: z.string(),
	tokenDecimal: z.coerce.number(),
	transactionIndex: Integer,
	gas: BigInt,
	gasPrice: BigInt,
	gasUsed: BigInt,
	cumulativeGasUsed: BigInt,
	input: z.string(),
	confirmations: Integer,
});

const ERC721TokenTransfer = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	hash: z.string(),
	nonce: Integer,
	blockHash: z.string(),
	from: Address,
	contractAddress: Address,
	to: Address,
	tokenID: z.string(),
	tokenName: z.string(),
	tokenSymbol: z.string(),
	tokenDecimal: z.literal("0"),
	transactionIndex: Integer,
	gas: BigInt,
	gasPrice: BigInt,
	gasUsed: BigInt,
	cumulativeGasUsed: BigInt,
	input: z.string(),
	confirmations: Integer,
});

const ERC1155TokenTransfer = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	hash: z.string(),
	nonce: Integer,
	blockHash: z.string(),
	transactionIndex: Integer,
	gas: BigInt,
	gasPrice: BigInt,
	gasUsed: BigInt,
	cumulativeGasUsed: BigInt,
	input: z.string(),
	contractAddress: Address,
	from: Address,
	to: Address,
	tokenID: z.string(),
	tokenValue: Ether,
	tokenName: z.string(),
	tokenSymbol: z.string(),
	confirmations: Integer,
});

const GetValidatedBlockOptions = z.object({
	blockType: z.enum(["blocks", "uncles"]).default("blocks"),
	page: z.number().int().min(1).default(1),
	offset: z.number().int().min(1).max(10000).default(10),
});
export type GetValidatedBlockOptions = Partial<z.infer<typeof GetValidatedBlockOptions>>;

const ValidatedBlock = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	blockReward: BigInt,
});

const MultiFileSourceCode = z
	.string()
	.refine(value => {
		if (!value.startsWith("{") || !value.endsWith("}")) {
			return false;
		}
		try {
			JSON.parse(value.substring(1, value.length - 1));
		} catch (e) {
			return false;
		}
		return true;
	})
	.transform(value => JSON.parse(value.substring(1, value.length - 1)) as unknown)
	.pipe(
		z.object({
			language: z.string(),
			sources: z
				.record(z.object({ content: z.string() }))
				.transform(sources =>
					Object.entries(sources).map(([name, { content }]) => ({ name, content })),
				),
			settings: z.object({}).passthrough().optional(),
		}),
	);

export const ContractSourceCode = z
	.object({
		SourceCode: MultiFileSourceCode.or(z.string()),
		ABI: z.string(),
		ContractName: z.string(),
		CompilerVersion: z.string(),
		OptimizationUsed: EnumBoolean,
		Runs: z.coerce.number(),
		ConstructorArguments: z.string(),
		EVMVersion: z.string(),
		Library: z.string(),
		LicenseType: z.string(),
		Proxy: EnumBoolean,
		Implementation: OptionalString,
		SwarmSource: OptionalString,
	})
	.transform(
		({
			SourceCode: sourceCode,
			ABI: abi,
			ContractName: name,
			CompilerVersion: compilerVersion,
			OptimizationUsed: isOptimized,
			Runs: optimizationRuns,
			ConstructorArguments: constructorArguments,
			EVMVersion: evmVersion,
			Library: library,
			LicenseType: license,
			Proxy: proxy,
			Implementation: implementation,
			SwarmSource: swarmSource,
		}) => ({
			name,
			license,
			evmVersion,
			compilerVersion,
			isOptimized,
			optimizationRuns,
			sourceCode,
			abi,
			constructorArguments,
			library,
			proxy,
			implementation,
			swarmSource,
		}),
	);
export type ContractSourceCode = z.infer<typeof ContractSourceCode>;

const NotContract = z
	.object({
		ABI: z.string(),
	})
	.refine(value => value.ABI === "Contract source code not verified")
	.transform(() => undefined);

const ContractSourceCodeResponse = NotContract.or(ContractSourceCode);

const GetContractCreationInput = Address.or(z.array(Address).min(1).max(5)).transform(addr => {
	if (Array.isArray(addr)) {
		return addr;
	}
	return [addr];
});
type GetContractCreationInput = z.infer<typeof GetContractCreationInput>;

const ContractCreation = z.object({
	contractAddress: Address,
	txHash: HexValue,
	contractCreator: Address,
});

const ContractExecutionStatus = z.object({
	isError: EnumBoolean,
	errDescription: OptionalString,
});

const TransactionReceiptStatus = z.object({
	status: EnumBoolean,
});

const BlockAndUncleRewards = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	blockMiner: Address,
	blockReward: BigInt,
	uncles: z.array(
		z
			.object({
				miner: Address,
				unclePosition: Integer,
				blockreward: BigInt,
			})
			.transform(({ blockreward, ...rest }) => ({ ...rest, blockReward: blockreward })),
	),
	uncleInclusionReward: BigInt,
});

const EstimatedTimeToBlockNo = z
	.object({
		CurrentBlock: Integer,
		CountdownBlock: Integer,
		ReamingBlock: Integer,
		EstimatedTimeInSec: z.number(),
	})
	.transform(
		({
			CurrentBlock: currentBlock,
			CountdownBlock: countdownBlock,
			ReamingBlock: remainingBlock,
			EstimatedTimeInSec: estimatedTime,
		}) => ({
			currentBlock,
			countdownBlock,
			remainingBlock,
			estimatedTime,
		}),
	);

const ClosestOption = z.enum(["before", "after"]).default("before");
type ClosestOption = z.infer<typeof ClosestOption>;

const EventLog = z.object({
	address: Address,
	topics: z.array(HexString),
	data: HexValue,
	blockNumber: Integer,
	timeStamp: TimeStamp,
	gasPrice: BigInt,
	gasUsed: BigInt,
	logIndex: HexValue,
	transactionHash: HexValue,
	transactionIndex: HexValue,
});

const Operator = z.enum(["and", "or"]);
export type Operator = z.infer<typeof Operator>;

const Topics = z
	.object({
		topic0: HexString,
	})
	.or(
		z
			.object({
				topic0: HexString,
				topic1: HexString,
				operator01: Operator,
			})
			.transform(({ operator01, ...rest }) => ({ ...rest, topic0_1_opr: operator01 })),
	);
export type Topics =
	| {
			topic0: HexString;
	  }
	| {
			topic0: HexString;
			topic1: HexString;
			operator01: Operator;
	  };

const Ether2Supply = z
	.object({
		EthSupply: Ether,
		Eth2Supply: Ether,
		BurntFees: Ether,
		WithdrawnTotal: Ether,
	})
	.transform(
		({
			EthSupply: etherSupply,
			Eth2Supply: ether2Supply,
			BurntFees: burntFees,
			WithdrawnTotal: withdrawnTotal,
		}) => ({
			etherSupply,
			ether2Supply,
			burntFees,
			withdrawnTotal,
		}),
	);

const EtherPrice = z
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

const DateString = z
	.string()
	.refine(data => data.match(/^\d{4}-\d{2}-\d{2}$/))
	.or(z.date().transform(date => date.toISOString().split("T")[0]));

const GetEthereumNodeSizeOptions = z.object({
	startDate: DateString,
	endDate: DateString,
	clientType: z.enum(["geth", "parity"]).default("geth"),
	syncMode: z.enum(["default", "archive"]).default("default"),
	sort: z.enum(["asc", "desc"]).default("asc"),
});
type GetEthereumNodeSizeOptions = {
	startDate: string;
	endDate: string;
	clientType?: "geth" | "parity";
	syncMode?: "default" | "archive";
	sort?: "asc" | "desc";
};

const EthereumNodeSize = z.object({
	blockNumber: Integer,
	chainTimeStamp: z
		.string()
		.refine(data => data.match(/^\d{4}-\d{2}-\d{2}$/))
		.transform(date => new Date(date)),
	chainSize: Integer,
	clientType: z.enum(["Geth", "Parity"]),
	syncMode: z.enum(["Default", "Archive"]),
});

type JsonRpcResponseOk = { ok: true; result: unknown };
const JsonRpcResponseOk = z
	.object({
		id: z.unknown(),
		jsonrpc: z.literal("2.0"),
		result: z.unknown(),
	})
	.transform(({ result }) => ({ ok: true, result }) as JsonRpcResponseOk);

type JsonRpcResponseError = { ok: false; error: { code: number; message: string } };
const JsonRpcResponseError = z
	.object({
		id: z.unknown(),
		jsonrpc: z.literal("2.0"),
		error: z.object({
			code: Integer,
			message: z.string(),
		}),
	})
	.transform(({ error }) => ({ ok: false, error }) as JsonRpcResponseError);

export const JsonRpcResponse = JsonRpcResponseOk.or(JsonRpcResponseError);
export type JsonRpcResponse = z.infer<typeof JsonRpcResponse>;

const BlockTagEnum = z.union([
	z.literal("earliest"),
	z.literal("finalized"),
	z.literal("safe"),
	z.literal("latest"),
]);
type BlockTagEnum = z.infer<typeof BlockTagEnum>;

const BlockTag = BlockTagEnum.or(Integer.min(0).transform(data => `0x${data.toString(16)}`));
export type BlockTag = BlockTagEnum | number;

export const Block = z
	.object({
		difficulty: BigInt,
		extraData: HexString,
		gasLimit: BigInt,
		gasUsed: BigInt,
		hash: HexString,
		logsBloom: HexString,
		miner: Address,
		mixHash: HexString,
		nonce: HexString,
		number: Integer,
		parentHash: HexString,
		receiptsRoot: HexString,
		sha3Uncles: HexString,
		size: Integer,
		stateRoot: HexString,
		timestamp: TimeStamp,
		totalDifficulty: BigInt,
		transactions: z.array(z.string()),
		transactionsRoot: HexString,
		uncles: z.array(HexString),
	})
	.or(z.null());

const SignedLegacyTransaction = z.object({
	type: z.literal("0x0"),
	nonce: BigInt,
	to: Address.or(z.null()),
	gas: BigInt,
	value: BigInt,
	input: HexString,
	gasPrice: BigInt,
	chainId: Integer,
	v: HexValue,
	r: HexValue,
	s: HexValue,
});

const Signed2930Transaction = z.object({
	type: z.literal(1),
	chainId: Integer,
	nonce: HexString,
	gasPrice: HexString,
	gasLimit: HexString,
	to: OptionalAddress,
	value: Ether,
	data: HexString.optional(),
	accessList: z.array(
		z.object({
			address: Address,
			storageKeys: z.array(HexString),
		}),
	),
	v: HexValue,
	r: HexValue,
	s: HexValue,
});

const Signed1559Transaction = z.object({
	type: z.literal("0x2"),
	nonce: HexString,
	gasLimit: HexString,
	to: OptionalAddress,
	maxPriorityFeePerGas: HexString,
	maxFeePerGas: HexString,
	value: Ether,
	data: HexString.optional(),
	accessList: z
		.array(
			z.object({
				address: Address,
				storageKeys: z.array(HexString),
			}),
		)
		.optional(),
	chainId: Integer,
	v: HexValue,
	r: HexValue,
	s: HexValue,
});

export const BlockWithTransactions = z
	.object({
		difficulty: BigInt,
		extraData: HexString,
		gasLimit: BigInt,
		gasUsed: BigInt,
		hash: HexString,
		logsBloom: HexString,
		miner: Address,
		mixHash: HexString,
		nonce: HexString,
		number: Integer,
		parentHash: HexString,
		receiptsRoot: HexString,
		sha3Uncles: HexString,
		size: Integer,
		stateRoot: HexString,
		timestamp: TimeStamp,
		totalDifficulty: BigInt,
		transactions: z.array(
			SignedLegacyTransaction.or(Signed2930Transaction).or(Signed1559Transaction),
		),
		transactionsRoot: HexString,
		uncles: z.array(HexString),
	})
	.or(z.null());

const NodeCount = z
	.object({
		UTCDate: z
			.string()
			.refine(data => data.match(/^\d{4}-\d{2}-\d{2}$/))
			.transform(date => new Date(date)),
		TotalNodeCount: Integer,
	})
	.transform(({ UTCDate: date, TotalNodeCount: nodeCount }) => ({
		date,
		nodeCount,
	}));

/**
 * {@link Client `Client`} uses `Cache` instance as a read-through cache first URL and
 * HTTP headers are checked in `Cache.storage`, if the resource is in the cache no request
 * is sent. Otherwise, resource is fetched and persisted on the cache.
 */
export interface Cache {
	// Function to use when serializing request URL and headers.
	serialize: (object: unknown) => string;
	/**
	 * {@link Storage `Storage`} instance from {@link https://unstorage.unjs.io/guide | `unstorage`} used for
	 * persisting resources.
	 */
	storage: Storage;
}

export interface ClientOptions {
	cache: Cache;
	apiKey: string;
	apiUrl: string;
}

export class Client {
	public readonly apiUrl: string = "https://api.etherscan.io/api";
	public readonly cache?: Cache;
	private readonly apiKey?: string;

	constructor({ cache, apiKey, apiUrl }: Partial<ClientOptions>) {
		this.cache = cache;
		this.apiKey = apiKey;
		if (apiUrl) {
			this.apiUrl = apiUrl;
		}
	}

	async getBalance(address: string, options: BalanceOptions = {}) {
		const balance = await this.callApi({
			module: "account",
			action: "balance",
			address,
			...BalanceOptions.parse(options),
		});
		return Ether.parse(balance);
	}

	async getBalances(addresses: string[] | string, options: BalanceOptions = {}) {
		const address = GetBalancesInput.parse(addresses).join(",");
		const result = await this.callApi({
			module: "account",
			action: "balancemulti",
			address,
			...BalanceOptions.parse(options),
		});
		return GetBalancesResult.parse(result);
	}

	async getTransactionsByAddress(address: string, options: PaginationOptions = {}) {
		const result = await this.callApi({
			module: "account",
			action: "txlist",
			address,
			...PaginationOptions.parse(options),
		});
		return z.array(Transaction).parse(result);
	}

	async getInternalTransactionsByAddress(address: string, options: PaginationOptions = {}) {
		const result = await this.callApi({
			module: "account",
			action: "txlistinternal",
			address,
			...PaginationOptions.parse(options),
		});
		return z.array(InternalTransaction).parse(result);
	}

	async getInternalTransactionsByHash(txHash: string) {
		const result = await this.callApi({
			module: "account",
			action: "txlistinternal",
			txhash: HexString.parse(txHash),
		});
		return z.array(InternalTransactionByHash).parse(result);
	}

	async getTransactionsByBlockRange(
		startBlock: number,
		endBlock: number,
		options?: Omit<PaginationOptions, "startBlock" | "endBlock">,
	) {
		const result = await this.callApi({
			module: "account",
			action: "txlistinternal",
			...PaginationOptions.parse({
				startBlock: Integer.min(0).parse(startBlock),
				endBlock: Integer.min(0).parse(endBlock),
				...options,
			}),
		});
		return z.array(InternalTransaction).parse(result);
	}

	async getERC20TokenTransfersByAddress(
		contractAddress: string,
		address: string,
		options: PaginationOptions = {},
	) {
		const result = await this.callApi({
			module: "account",
			action: "tokentx",
			contractAddress: Address.parse(contractAddress),
			address: Address.parse(address),
			...PaginationOptions.parse(options),
		});
		return z.array(ERC20TokenTransfer).parse(result);
	}

	async getERC721TokenTransfersByAddress(
		contractAddress: string,
		address: string,
		options: PaginationOptions = {},
	) {
		const result = await this.callApi({
			module: "account",
			action: "tokennfttx",
			contractAddress: Address.parse(contractAddress),
			address: Address.parse(address),
			...PaginationOptions.parse(options),
		});
		return z.array(ERC721TokenTransfer).parse(result);
	}

	async getERC1155TokenTransfersByAddress(
		contractAddress: string,
		address: string,
		options: PaginationOptions = {},
	) {
		const result = await this.callApi({
			module: "account",
			action: "token1155tx",
			contractAddress: Address.parse(contractAddress),
			address: Address.parse(address),
			...PaginationOptions.parse(options),
		});
		return z.array(ERC1155TokenTransfer).parse(result);
	}

	async getBlocksValidatedByAddress(address: string, options: GetValidatedBlockOptions = {}) {
		const result = await this.callApi({
			module: "account",
			action: "getminedblocks",
			address,
			...GetValidatedBlockOptions.parse(options),
		});
		return z.array(ValidatedBlock).parse(result);
	}

	async getABIForContract(address: string) {
		const result = await this.callApi({
			module: "contract",
			action: "getabi",
			address: Address.parse(address),
		});
		return HexString.parse(result);
	}

	async getContractSourceCode(address: string) {
		const response = await this.callApi({
			module: "contract",
			action: "getsourcecode",
			address: Address.parse(address),
		});
		return z.array(ContractSourceCodeResponse).parse(response);
	}

	async getContractCreation(addresses: string[]) {
		const contractAddresses = GetContractCreationInput.parse(addresses).join(",");
		const response = await this.callApi({
			module: "contract",
			action: "getcontractcreation",
			contractAddresses,
		});
		return z.array(ContractCreation).parse(response);
	}

	async getContractExecutionStatus(hash: string) {
		const response = await this.callApi({
			module: "transaction",
			action: "getstatus",
			txhash: HexString.parse(hash),
		});
		return ContractExecutionStatus.parse(response);
	}

	async getTransactionReceiptStatus(hash: string) {
		const response = await this.callApi({
			module: "transaction",
			action: "gettxreceiptstatus",
			txhash: HexString.parse(hash),
		});
		return TransactionReceiptStatus.parse(response);
	}

	async getBlockAndUncleRewardsByBlockNumber(blockNumber: number) {
		const response = await this.callApi({
			module: "block",
			action: "getblockreward",
			blockno: Integer.min(0).parse(blockNumber).toString(),
		});
		return BlockAndUncleRewards.parse(response);
	}

	async getEstimatedTimeToBlockNo(blockNumber: number) {
		const response = await this.callApi({
			module: "block",
			action: "getblockcountdown",
			blockno: Integer.min(0).parse(blockNumber).toString(),
		});
		return EstimatedTimeToBlockNo.parse(response);
	}

	async getBlockNoByTimestamp(timestamp: number, closest?: ClosestOption) {
		const closestString = ClosestOption.parse(closest);
		const response = await this.callApi({
			module: "block",
			action: "getblocknobytime",
			timestamp: Integer.min(0).parse(timestamp).toString(),
			closest: closestString,
		});
		return Integer.parse(response);
	}

	async getEventLogsByAddress(address: string, options: LogPaginationOptions = {}) {
		const response = await this.callApi({
			module: "logs",
			action: "getlogs",
			address: Address.parse(address),
			...LogPaginationOptions.parse(options),
		});
		return z.array(EventLog).parse(response);
	}

	async getEventLogsByTopics(topics: Topics, options: LogPaginationOptions = {}) {
		const response = await this.callApi({
			module: "logs",
			action: "getLogs",
			...Topics.parse(topics),
			...LogPaginationOptions.parse(options),
		});
		return z.array(EventLog).parse(response);
	}

	async getEventLogsByAddressFilteredByTopics(
		address: string,
		topics: Topics,
		options: LogPaginationOptions = {},
	) {
		const response = await this.callApi({
			module: "logs",
			action: "getLogs",
			address: Address.parse(address),
			...Topics.parse(topics),
			...LogPaginationOptions.parse(options),
		});
		return z.array(EventLog).parse(response);
	}

	async getBlockNumber() {
		const response = await this.callJsonRpc({
			action: "eth_blockNumber",
		});
		return Integer.parse(response);
	}

	async getBlockByNumber(blockTag: BlockTag) {
		const tag = BlockTag.parse(blockTag);
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getBlockByNumber",
			tag,
			boolean: "false",
		});
		return Block.parse(response);
	}

	async getBlockByNumberWithTransactions(blockTag: BlockTag) {
		const tag = BlockTag.parse(blockTag);
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getBlockByNumber",
			tag,
			boolean: "true",
		});
		return BlockWithTransactions.parse(response);
	}

	async getEtherSupply() {
		const response = await this.callApi({
			module: "stats",
			action: "ethsupply",
		});
		return Ether.parse(response);
	}

	async getEther2Supply() {
		const response = await this.callApi({
			module: "stats",
			action: "ethsupply2",
		});
		return Ether2Supply.parse(response);
	}

	async getLastEtherPrice() {
		const response = await this.callApi({
			module: "stats",
			action: "ethprice",
		});
		return EtherPrice.parse(response);
	}

	async getEthereumNodeSize(options: GetEthereumNodeSizeOptions) {
		const { startDate, endDate, clientType, sort, syncMode } =
			GetEthereumNodeSizeOptions.parse(options);
		const response = await this.callApi({
			module: "stats",
			action: "chainsize",
			startdate: startDate,
			enddate: endDate,
			clienttype: clientType,
			sort,
			syncmode: syncMode,
		});
		const nodeSizes = z.array(EthereumNodeSize).parse(response);
		return {
			clientType,
			syncMode,
			nodeSizes: nodeSizes.map(
				({ blockNumber: blockNo, chainSize, chainTimeStamp: timeStamp }) => ({
					blockNo,
					chainSize,
					timeStamp,
				}),
			),
		};
	}

	async getNodeCount() {
		const response = await this.callApi({
			module: "stats",
			action: "nodecount",
		});
		return NodeCount.parse(response);
	}

	async fetch(params: Record<string, Primitive>): Promise<unknown> {
		const url = this.encodeQueryParams(params);
		if (!this.cache) {
			return await ofetch(url);
		}
		const key = this.cache.serialize(params);
		const value = await this.cache.storage.getItem(key);
		if (value) {
			return value;
		}
		const response = await ofetch(url);
		await this.cache.storage.setItem(key, response);
		return response;
	}

	private encodeQueryParams(params: Record<string, Primitive>): URL {
		const url = new URL(this.apiUrl);
		if (this.apiKey) {
			url.searchParams.set("apikey", this.apiKey);
		}
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined || value === null) {
				continue;
			}
			url.searchParams.set(key, value.toString());
		}
		return url;
	}

	private async callApi(params: EndpointParams): Promise<unknown> {
		const response = await this.fetch(params);
		const apiResponse = Response.parse(response);
		if (apiResponse.status === "0") {
			throw new Error(apiResponse.message);
		}
		return apiResponse.result;
	}

	private async callJsonRpc(params: Omit<EndpointParams, "module">): Promise<unknown> {
		const response = await this.fetch({
			module: "proxy",
			...params,
		});
		const jsonRpcResponse = JsonRpcResponse.parse(response);
		if (!jsonRpcResponse.ok) {
			throw new Error(jsonRpcResponse.error.message);
		}
		return jsonRpcResponse.result;
	}
}
