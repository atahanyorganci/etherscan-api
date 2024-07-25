import { ofetch } from "ofetch";
import type { Storage } from "unstorage";
import { z } from "zod";
import {
	Erc20Transfer,
	Erc721Transfer,
	Erc1155Transfer,
	GetBalancesInput,
	GetBalancesResult,
	GetTokenTransfersInput,
	GetValidatedBlockOptions,
	ValidatedBlock,
} from "./account";
import {
	Address,
	BigInt_,
	BlockTagEnum,
	EnumBoolean,
	Ether,
	HexString,
	HexValue,
	Integer,
	OptionalAddress,
	OptionalString,
	TimeStamp,
} from "./core";
import {
	AbiStr,
	AbiItem,
	ContractSourceCodeResponse,
	GetContractCreationInput,
	ContractCreation,
} from "./contract";
import { ContractExecutionStatus, TransactionReceiptStatus } from "./transaction";
import { BlockAndUncleRewards, ClosestOption, EstimatedTimeToBlockNo } from "./block";

type Primitive = boolean | string | number | undefined | null;

const SuccessResponse = z.object({
	status: z.literal("1"),
	message: z.string(),
	result: z.unknown(),
});

const ErrorResponse = z.object({
	status: z.literal("0"),
	message: z.string(),
	result: z.unknown(),
});

const Response = z.discriminatedUnion("status", [SuccessResponse, ErrorResponse]);
type Response = z.infer<typeof Response>;

type EndpointParams = { module: string; action: string } & Record<string, Primitive>;

export const PaginationOptions = z.object({
	startBlock: Integer.min(0).optional(),
	endBlock: Integer.min(0).optional(),
	page: Integer.min(1).optional(),
	offset: Integer.min(1).max(10000).optional(),
	sort: z.enum(["asc", "desc"]).optional(),
});
/**
 * - `startBlock` - block number to start searching for transactions
 * - `endBlock` - block number to stop searching for transactions
 * - `page` - page number, if pagination is enabled
 * - `offset` - the number of transactions displayed per page
 * - `sort` - the sorting preference, use asc to sort by ascending and desc to sort by descending
 *
 * Tip: Specify a smaller startblock and endblock range for faster search results.
 */
export type PaginationOptions = Partial<z.infer<typeof PaginationOptions>>;

function ensurePaginationOptions(options: PaginationOptions) {
	const { startBlock, endBlock, page, offset, sort } = options;
	return { startblock: startBlock, endblock: endBlock, page, offset, sort };
}

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
	gas: BigInt_,
	gasPrice: BigInt_,
	isError: EnumBoolean,
	txreceipt_status: EnumBoolean,
	input: HexValue,
	contractAddress: OptionalAddress,
	cumulativeGasUsed: BigInt_,
	gasUsed: BigInt_,
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
	gas: BigInt_,
	gasUsed: BigInt_,
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
	input: HexValue.or(OptionalString),
	type: z.enum(["call", "create"]),
	gas: BigInt_,
	gasUsed: BigInt_,
	isError: EnumBoolean,
	errCode: OptionalString,
});

const EventLog = z.object({
	address: Address,
	topics: z.array(HexString),
	data: HexValue,
	blockNumber: Integer,
	timeStamp: TimeStamp,
	gasPrice: BigInt_,
	gasUsed: BigInt_,
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

const BlockTag = BlockTagEnum.or(Integer.min(0).transform(data => `0x${data.toString(16)}`));
export type BlockTag = BlockTagEnum | number;

export const Block = z
	.object({
		difficulty: BigInt_,
		extraData: HexString,
		gasLimit: BigInt_,
		gasUsed: BigInt_,
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
		totalDifficulty: BigInt_,
		transactions: z.array(z.string()),
		transactionsRoot: HexString,
		uncles: z.array(HexString),
	})
	.or(z.null());

const SignedLegacyTransaction = z.object({
	type: z.literal("0x0"),
	nonce: BigInt_,
	to: Address.or(z.null()),
	gas: BigInt_,
	value: BigInt_,
	input: HexString,
	gasPrice: BigInt_,
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
		difficulty: BigInt_,
		extraData: HexString,
		gasLimit: BigInt_,
		gasUsed: BigInt_,
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
		totalDifficulty: BigInt_,
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

	/**
	 * Returns the Ether balance of a given address.
	 *
	 * @param address address to check for balance
	 * @param tag pre-defined block parameter, either `"finalized"`, `"earliest"`, `"pending"` or `"latest"`
	 * @returns balance in wei
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-ether-balance-for-a-single-address | Etherscan API docs}
	 */
	async getBalance(address: string, tag?: BlockTagEnum) {
		const balance = await this.callApi({
			module: "account",
			action: "balance",
			address: Address.parse(address),
			tag: BlockTagEnum.optional().parse(tag),
		});
		return Ether.parse(balance);
	}

	/**
	 * Returns the balance of the accounts from a list of addresses.
	 *
	 * @param addresses  addresses to check for balance, up to **20 addresses** per call
	 * @param tag block tag
	 * @returns balances in wei
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-ether-balance-for-multiple-addresses-in-a-single-call | Etherscan API docs}
	 */
	async getBalances(addresses: string[], tag?: BlockTagEnum) {
		const result = await this.callApi({
			module: "account",
			action: "balancemulti",
			address: GetBalancesInput.parse(addresses).join(","),
			tag: BlockTagEnum.optional().parse(tag),
		});
		return GetBalancesResult.parse(result);
	}

	/**
	 * Returns the list of transactions performed by an address, with optional pagination.
	 *
	 * @param address address to list transactions for
	 * @param options pagination options {@link PaginationOptions `PaginationOptions`}
	 * @returns list of transactions
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-normal-transactions-by-address | Etherscan API docs}
	 */
	async getTransactions(address: string, options: PaginationOptions = {}) {
		const result = await this.callApi({
			module: "account",
			action: "txlist",
			address: Address.parse(address),
			...ensurePaginationOptions(options),
		});
		return z.array(Transaction).parse(result);
	}

	/**
	 * Returns the list of transactions performed by an address, with optional pagination.
	 *
	 * @param address address to list transactions for
	 * @param options pagination options {@link PaginationOptions `PaginationOptions`}
	 * @returns list of internal transactions
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-normal-transactions-by-address | Etherscan API docs}
	 */
	async getInternalTransactions(address: string, options: PaginationOptions = {}) {
		const result = await this.callApi({
			module: "account",
			action: "txlistinternal",
			address: Address.parse(address),
			...ensurePaginationOptions(options),
		});
		return z.array(InternalTransaction).parse(result);
	}

	/**
	 * Returns the list of internal transactions performed within a transaction.
	 *
	 * @param hash hash to check for internal transactions
	 * @returns list of internal transactions
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-internal-transactions-by-transaction-hash | Etherscan API docs}
	 */
	async getInternalTransactionByTransaction(hash: string) {
		const result = await this.callApi({
			module: "account",
			action: "txlistinternal",
			txhash: HexString.parse(hash),
		});
		return z.array(InternalTransactionByHash).parse(result);
	}

	/**
	 * Returns the list of ERC-20 tokens transferred by an address, with optional filtering by token contract.
	 *
	 * @param input specify `address` for filter based on account, specify `contractAddress` to filter by
	 * ERC20 token, specify both to filter by account and ERC20 token
	 * @param options pagination options {@link PaginationOptions `PaginationOptions`}
	 * @returns list of {@link Erc20Transfer `Erc20Transfer`}s
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-erc20-token-transfer-events-by-address | Etherscan API docs}
	 */
	async getErc20Transfers(input: GetTokenTransfersInput, options: PaginationOptions = {}) {
		const { address, contractAddress } = GetTokenTransfersInput.parse(input);
		const result = await this.callApi({
			module: "account",
			action: "tokentx",
			address,
			contractaddress: contractAddress,
			...ensurePaginationOptions(options),
		});
		return z.array(Erc20Transfer).parse(result);
	}

	/**
	 * Returns the list of ERC-721 tokens transferred by an address, with optional filtering by token contract.
	 *
	 * @param input specify `address` for filter based on account, specify `contractAddress` to filter by
	 * ERC721 token, specify both to filter by account and ERC721 token
	 * @param options pagination options {@link PaginationOptions `PaginationOptions`}
	 * @returns list of {@link Erc721Transfer `Erc721Transfer`}s
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-erc721-token-transfer-events-by-address | Etherscan API docs}
	 */
	async getErc721Transfers(input: GetTokenTransfersInput, options: PaginationOptions = {}) {
		const { address, contractAddress } = GetTokenTransfersInput.parse(input);
		const result = await this.callApi({
			module: "account",
			action: "tokennfttx",
			address,
			contractaddress: contractAddress,
			...ensurePaginationOptions(options),
		});
		return z.array(Erc721Transfer).parse(result);
	}

	/**
	 * Returns the list of ERC-1155 tokens transferred by an address, with optional filtering by token contract.
	 *
	 * @param input specify `address` for filter based on account, specify `contractAddress` to filter by
	 * ERC1155 token, specify both to filter by account and ERC1155 token
	 * @param options pagination options {@link PaginationOptions `PaginationOptions`}
	 * @returns list of {@link Erc1155Transfer `Erc1155Transfer`}s
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-erc1155-token-transfer-events-by-address | Etherscan API docs}
	 */
	async getErc1155Transfers(input: GetTokenTransfersInput, options: PaginationOptions = {}) {
		const { address, contractAddress } = GetTokenTransfersInput.parse(input);
		const result = await this.callApi({
			module: "account",
			action: "token1155tx",
			address,
			contractaddress: contractAddress,
			...ensurePaginationOptions(options),
		});
		return z.array(Erc1155Transfer).parse(result);
	}

	/**
	 * Returns the list of blocks validated by an address.
	 *
	 * @param address validator address
	 * @param options {@link GetValidatedBlockOptions `GetValidatedBlockOptions`}
	 * @returns array of {@link ValidatedBlock `ValidatedBlock`}
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-list-of-blocks-validated-by-address Etherscan API docs}
	 */
	async getBlocksValidatedByAddress(address: string, options: GetValidatedBlockOptions = {}) {
		const result = await this.callApi({
			module: "account",
			action: "getminedblocks",
			address: Address.parse(address),
			...GetValidatedBlockOptions.parse(options),
		});
		return z.array(ValidatedBlock).parse(result);
	}

	/**
	 * Returns the Application Binary Interface (ABI) of a verified smart contract.
	 *
	 * @param address contract address that has a verified source code
	 * @returns list of {@link AbiItem}
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/contracts#get-contract-abi-for-verified-contract-source-codes | Etherscan API docs}
	 * @see {@link https://docs.soliditylang.org/en/latest/abi-spec.html#json | Solidity ABI spec}
	 */
	async getAbi(address: string) {
		const result = await this.callApi({
			module: "contract",
			action: "getabi",
			address: Address.parse(address),
		});
		return AbiStr.parse(result);
	}

	/**
	 * Returns the Solidity source code of a verified smart contract.
	 *
	 * @param address contract address that has a verified source code
	 * @returns source code for contract
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/contracts#get-contract-source-code-for-verified-contract-source-codes | Etherscan API docs}
	 */
	async getSourceCode(address: string) {
		const response = await this.callApi({
			module: "contract",
			action: "getsourcecode",
			address: Address.parse(address),
		});
		return z.array(ContractSourceCodeResponse).parse(response);
	}

	/**
	 * Returns a contract's deployer address and transaction hash it was created, up to 5 at a time.
	 *
	 * @param addresses contract addresses, up to 5 at a time
	 * @returns array of {@link ContractCreation `ContractCreation`} objects
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/contracts#get-contract-creator-and-creation-tx-hash Etherscan API docs}
	 */
	async getContractCreation(addresses: string[]) {
		const contractAddresses = GetContractCreationInput.parse(addresses).join(",");
		const response = await this.callApi({
			module: "contract",
			action: "getcontractcreation",
			contractAddresses,
		});
		return z.array(ContractCreation).parse(response);
	}

	/**
	 * Returns the status code of a contract execution.
	 *
	 * @param hash transaction hash to check the execution status
	 * @returns `ContractExecutionStatus`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats#check-contract-execution-status Etherscan API docs}
	 */
	async checkTransactionStatus(hash: string) {
		const response = await this.callApi({
			module: "transaction",
			action: "getstatus",
			txhash: HexString.parse(hash),
		});
		return ContractExecutionStatus.parse(response);
	}

	/**
	 * Returns the status code of a transaction execution.
	 *
	 * @param hash  transaction hash to check the receipt status
	 * @returns `TransactionReceiptStatus`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats#check-transaction-receipt-status Etherscan API docs}
	 */
	async checkTransactionReceiptStatus(hash: string) {
		const response = await this.callApi({
			module: "transaction",
			action: "gettxreceiptstatus",
			txhash: HexString.parse(hash),
		});
		return TransactionReceiptStatus.parse(response);
	}

	/**
	 * Returns the block reward and 'Uncle' block rewards.
	 * @param blockNumber block number to check block rewards for
	 * @returns `BlockAndUncleRewards`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/blocks#get-block-and-uncle-rewards-by-blockno Etherscan API docs}
	 */
	async getBlockAndUncleRewardsByBlockNumber(blockNumber: number) {
		const response = await this.callApi({
			module: "block",
			action: "getblockreward",
			blockno: Integer.min(0).parse(blockNumber),
		});
		return BlockAndUncleRewards.parse(response);
	}

	/**
	 * Returns the estimated time remaining, in seconds, until a certain block is mined.
	 *
	 * @param blockNumber block number to estimate time remaining to be mined
	 * @returns `EstimatedTimeToBlockNo`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/blocks#get-estimated-block-countdown-time-by-blockno Etherscan API docs}
	 */
	async getEstimatedTimeToBlockNumber(blockNumber: number) {
		const response = await this.callApi({
			module: "block",
			action: "getblockcountdown",
			blockno: Integer.min(0).parse(blockNumber),
		});
		return EstimatedTimeToBlockNo.parse(response);
	}

	/**
	 * Returns the block number that was mined at a certain timestamp.
	 *
	 * @param timestamp Unix timestamp in seconds.
	 * @param closest the closest available block to the provided timestamp, either before or after
	 * @returns closest block number
	 *
	 * @see {@link  https://docs.etherscan.io/api-endpoints/blocks#get-estimated-block-countdown-time-by-blockno Etherscan API docs}
	 */
	async getBlockNoByTimestamp(timestamp: number, closest?: ClosestOption) {
		const response = await this.callApi({
			module: "block",
			action: "getblocknobytime",
			timestamp: Integer.min(0).parse(timestamp),
			closest: ClosestOption.optional().parse(closest),
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
			throw new Error(apiResponse.result);
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
