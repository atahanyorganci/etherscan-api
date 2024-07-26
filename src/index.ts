export {
	BeaconChainWithdrawal,
	Erc20Transfer,
	Erc721Transfer,
	Erc1155Transfer,
	GetBalancesParams,
	GetBalancesResponse,
	GetTokenTransfersParams,
	GetValidatedBlockOptions,
	InternalTransaction,
	InternalTransactionsOfTransaction,
	Transaction,
	ValidatedBlock,
} from "./account";
export { BlockAndUncleRewards, ClosestOption, EstimatedTimeToBlockNumber } from "./block";
export {
	AbiItem,
	ContractCreation,
	ContractSourceCodeResponse,
	GetContractCreationParams,
} from "./contract";
export { Address, BlockIdentifier } from "./core";
export { GasOracleResponse } from "./gas-tracker";
export {
	Block,
	BlockWithTransactions,
	CallParams,
	EipTransaction,
	GetTransactionParams,
	TransactionReceipt,
	UncleBlock,
} from "./json-rpc";
export { GetLogsParams, Log } from "./logs";
export {
	Ether2Supply,
	EtherPriceResponse,
	GetEthereumNodeSizeParams,
	GetEthereumNodesSizeResponse,
	NodeCountResponse,
} from "./stats";
export { GetErc20BalanceParams } from "./token";
export { ContractExecutionStatus, TransactionReceiptStatus } from "./transaction";

import { ofetch } from "ofetch";
import type { Storage } from "unstorage";
import { z } from "zod";
import {
	BeaconChainWithdrawal,
	Erc20Transfer,
	Erc721Transfer,
	Erc1155Transfer,
	GetBalancesParams,
	GetBalancesResponse,
	GetTokenTransfersParams,
	GetValidatedBlockOptions,
	InternalTransaction,
	InternalTransactionsOfTransaction,
	Transaction,
	ValidatedBlock,
} from "./account";
import { BlockAndUncleRewards, ClosestOption, EstimatedTimeToBlockNumber } from "./block";
import {
	AbiItem,
	AbiStr,
	ContractCreation,
	ContractSourceCodeResponse,
	GetContractCreationParams,
} from "./contract";
import {
	Address,
	type BlockIdentifier,
	Ether,
	HexString,
	HexValue,
	Integer,
	Wei,
	ensureBlockIdentifier,
} from "./core";
import { GasOracleResponse } from "./gas-tracker";
import {
	Block,
	BlockWithTransactions,
	CallParams,
	EipTransaction,
	GetTransactionParams,
	TransactionReceipt,
	UncleBlock,
} from "./json-rpc";
import { GetLogsParams, Log } from "./logs";
import {
	Ether2Supply,
	EtherPriceResponse,
	GetEthereumNodeSizeParams,
	GetEthereumNodesSizeResponse,
	NodeCountResponse,
} from "./stats";
import { GetErc20BalanceParams } from "./token";
import { ContractExecutionStatus, TransactionReceiptStatus } from "./transaction";

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

/**
 * - `startBlock` - block number to start searching for transactions
 * - `endBlock` - block number to stop searching for transactions
 * - `page` - page number, if pagination is enabled
 * - `offset` - the number of transactions displayed per page
 * - `sort` - the sorting preference, use asc to sort by ascending and desc to sort by descending
 *
 * Tip: Specify a smaller startblock and endblock range for faster search results.
 * @public
 */
export const PaginationOptions = z.object({
	startBlock: Integer.min(0).optional(),
	endBlock: Integer.min(0).optional(),
	page: Integer.min(1).optional(),
	offset: Integer.min(1).max(10000).optional(),
	sort: z.enum(["asc", "desc"]).optional(),
});
/** @public */
export type PaginationOptions = Partial<z.infer<typeof PaginationOptions>>;

function ensurePaginationOptions(options: PaginationOptions) {
	const { startBlock, endBlock, page, offset, sort } = PaginationOptions.parse(options);
	return { startblock: startBlock, endblock: endBlock, page, offset, sort };
}

export const LogPaginationOptions = z.object({
	fromBlock: Integer.min(0).optional(),
	toBlock: Integer.min(0).optional(),
	page: Integer.min(1).optional(),
	offset: Integer.min(1).max(10000).optional(),
});
export type LogPaginationOptions = Partial<z.infer<typeof LogPaginationOptions>>;

const JsonRpcResponseOk = z
	.object({
		id: z.unknown(),
		jsonrpc: z.literal("2.0"),
		result: z.unknown(),
	})
	.transform(({ result }) => ({ ok: true as const, result }));
const JsonRpcResponseError = z
	.object({
		id: z.unknown(),
		jsonrpc: z.literal("2.0"),
		error: z.object({
			code: Integer,
			message: z.string(),
		}),
	})
	.transform(({ error }) => ({ ok: false as const, error }));
const JsonRpcResponse = JsonRpcResponseOk.or(JsonRpcResponseError);

/**
 * Pre-defined block parameter, either `"finalized"`, `"earliest"`, `"pending"` or `"latest"`
 * @public
 */
export const Tag = z.enum(["earliest", "pending", "latest"]);
/** @public */
export type Tag = z.infer<typeof Tag>;

/**
 * {@link Client | `Client`} uses | `Cache` instance as a read-through cache first URL and
 * HTTP headers are checked in `Cache.storage`, if the resource is in the cache no request
 * is sent. Otherwise, resource is fetched and persisted on the cache.
 * @public
 */
export interface Cache {
	// Function to use when serializing request URL and headers.
	serialize: (object: unknown) => string;
	/**
	 * `Storage` instance from {@link https://unstorage.unjs.io/guide | `unstorage`} used for
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
	 * @param address - address to check for balance
	 * @param tag - {@link Tag | `Tag`}
	 * @returns balance in wei
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-ether-balance-for-a-single-address | Etherscan API docs}
	 */
	async getBalance(address: string, tag?: Tag) {
		const balance = await this.callApi({
			module: "account",
			action: "balance",
			address: Address.parse(address),
			tag: Tag.default("latest").parse(tag),
		});
		return Ether.parse(balance);
	}

	/**
	 * Returns the balance of the accounts from a list of addresses.
	 *
	 * @param addresses - addresses to check for balance, up to **20 addresses** per call
	 * @param tag - {@link Tag | `Tag`}
	 * @returns balances in wei
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-ether-balance-for-multiple-addresses-in-a-single-call | Etherscan API docs}
	 */
	async getBalances(addresses: string[], tag?: Tag) {
		const result = await this.callApi({
			module: "account",
			action: "balancemulti",
			address: GetBalancesParams.parse(addresses).join(","),
			tag: Tag.default("latest").parse(tag),
		});
		return GetBalancesResponse.parse(result);
	}

	/**
	 * Returns the list of transactions performed by an address, with optional pagination.
	 * Note: Transactions returned by Etherscan are different from those returned by JSON-RPC.
	 *
	 * @param address - address to list transactions for
	 * @param options - {@link PaginationOptions | `PaginationOptions`}
	 * @returns array of {@link Transaction | `Transaction`} objects
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
	 * @param address - address to list transactions for
	 * @param options - {@link PaginationOptions | `PaginationOptions`}
	 * @returns array of {@link InternalTransaction | `InternalTransaction`} objects
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
	 * @param txHash - transaction hash to check for internal transactions
	 * @returns array of {@link InternalTransactionsOfTransaction | `InternalTransactionsOfTransaction`} objects
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-internal-transactions-by-transaction-hash | Etherscan API docs}
	 */
	async getInternalTransactionsInTransaction(txHash: string, options: PaginationOptions = {}) {
		const result = await this.callApi({
			module: "account",
			action: "txlistinternal",
			txhash: HexString.parse(txHash),
			...ensurePaginationOptions(options),
		});
		return z.array(InternalTransactionsOfTransaction).parse(result);
	}

	/**
	 * Returns the list of ERC-20 tokens transferred by an address, with optional filtering by token contract.
	 *
	 * @param params - specify `address` for filter based on account, specify `contractAddress` to filter by
	 * ERC20 token, specify both to filter by account and ERC20 token
	 * @param options - pagination options {@link PaginationOptions | `PaginationOptions`}
	 * @returns array of {@link Erc20Transfer | `Erc20Transfer`} objects
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-erc20-token-transfer-events-by-address | Etherscan API docs}
	 */
	async getErc20Transfers(params: GetTokenTransfersParams, options: PaginationOptions = {}) {
		const { address, contractAddress } = GetTokenTransfersParams.parse(params);
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
	 * @param params - specify `address` for filter based on account, specify `contractAddress` to filter by
	 * ERC721 token, specify both to filter by account and ERC721 token
	 * @param options - pagination options {@link PaginationOptions | `PaginationOptions`}
	 * @returns array of {@link Erc721Transfer | `Erc721Transfer`} objects
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-erc721-token-transfer-events-by-address | Etherscan API docs}
	 */
	async getErc721Transfers(params: GetTokenTransfersParams, options: PaginationOptions = {}) {
		const { address, contractAddress } = GetTokenTransfersParams.parse(params);
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
	 * @param params - specify `address` for filter based on account, specify `contractAddress` to filter by
	 * ERC1155 token, specify both to filter by account and ERC1155 token
	 * @param options - pagination options {@link PaginationOptions | `PaginationOptions`}
	 * @returns list of {@link Erc1155Transfer | `Erc1155Transfer`}s
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-erc1155-token-transfer-events-by-address | Etherscan API docs}
	 */
	async getErc1155Transfers(params: GetTokenTransfersParams, options: PaginationOptions = {}) {
		const { address, contractAddress } = GetTokenTransfersParams.parse(params);
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
	 * @param address - validator address
	 * @param options - {@link GetValidatedBlockOptions | `GetValidatedBlockOptions`}
	 * @returns array of {@link ValidatedBlock | `ValidatedBlock`}
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-list-of-blocks-validated-by-address | Etherscan API docs}
	 */
	async getBlocksValidatedByAddress(address: string, options: GetValidatedBlockOptions = {}) {
		const { blockType, offset, page } = GetValidatedBlockOptions.parse(options);
		const result = await this.callApi({
			module: "account",
			action: "getminedblocks",
			address: Address.parse(address),
			blocktype: blockType,
			offset,
			page,
		});
		return z.array(ValidatedBlock).parse(result);
	}

	/**
	 * Returns the beacon chain withdrawals made to an address.
	 *
	 * @param address - validator address
	 * @param options - {@link PaginationOptions | `PaginationOptions`}
	 * @returns array of {@link BeaconChainWithdrawal | `BeaconChainWithdrawal`}
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-beacon-chain-withdrawals-by-address-and-block-range | Etherscan API docs}
	 */
	async getBeaconChainWithdrawals(address: string, options: PaginationOptions = {}) {
		const result = await this.callApi({
			module: "account",
			action: "txsBeaconWithdrawal",
			address: Address.parse(address),
			...ensurePaginationOptions(options),
		});
		return z.array(BeaconChainWithdrawal).parse(result);
	}

	/**
	 * Returns the Application Binary Interface (ABI) of a verified smart contract.
	 *
	 * @param address - contract address that has a verified source code
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
	 * @param address - contract address that has a verified source code
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
	 * @param addresses - contract addresses, up to 5 at a time
	 * @returns array of {@link ContractCreation | `ContractCreation`} objects
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/contracts#get-contract-creator-and-creation-tx-hash | Etherscan API docs}
	 */
	async getContractCreation(addresses: string[]) {
		const contractAddresses = GetContractCreationParams.parse(addresses).join(",");
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
	 * @param hash - transaction hash to check the execution status
	 * @returns `ContractExecutionStatus`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats#check-contract-execution-status | Etherscan API docs}
	 */
	async getTransactionStatus(hash: string) {
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
	 * @param hash -  transaction hash to check the receipt status
	 * @returns `TransactionReceiptStatus`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats#check-transaction-receipt-status | Etherscan API docs}
	 */
	async getTransactionReceiptStatus(hash: string) {
		const response = await this.callApi({
			module: "transaction",
			action: "gettxreceiptstatus",
			txhash: HexString.parse(hash),
		});
		return TransactionReceiptStatus.parse(response);
	}

	/**
	 * Returns the block reward and 'Uncle' block rewards.
	 * @param blockNumber - block number to check block rewards for
	 * @returns `BlockAndUncleRewards`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/blocks#get-block-and-uncle-rewards-by-blockno | Etherscan API docs}
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
	 * @param blockNumber - block number to estimate time remaining to be mined
	 * @returns `EstimatedTimeToBlockNumber`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/blocks#get-estimated-block-countdown-time-by-blockno | Etherscan API docs}
	 */
	async getEstimatedTimeToBlockNumber(blockNumber: number) {
		const response = await this.callApi({
			module: "block",
			action: "getblockcountdown",
			blockno: Integer.min(0).parse(blockNumber),
		});
		return EstimatedTimeToBlockNumber.parse(response);
	}

	/**
	 * Returns the block number that was mined at a certain timestamp.
	 *
	 * @param timestamp - Unix timestamp in seconds.
	 * @param closest - the closest available block to the provided timestamp, either before or after
	 * @returns closest block number
	 *
	 * @see {@link  https://docs.etherscan.io/api-endpoints/blocks#get-estimated-block-countdown-time-by-blockno | Etherscan API docs}
	 */
	async getBlockNumberByTimestamp(timestamp: number, closest: ClosestOption) {
		const response = await this.callApi({
			module: "block",
			action: "getblocknobytime",
			timestamp: Integer.min(0).parse(timestamp),
			closest: ClosestOption.parse(closest),
		});
		return Integer.parse(response);
	}

	/**
	 * Returns the event logs from an address, with optional filtering by block range.
	 *
	 * @param params - {@link GetLogsParams | `GetLogsParams`} object describing event filter
	 * @param options - {@link LogPaginationOptions | `LogPaginationOptions`}
	 * @returns array of {@link Log | `Log`} objects
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/logs | Etherscan API docs}
	 */
	async getLogs(params: GetLogsParams, options: LogPaginationOptions = {}) {
		const response = await this.callApi({
			module: "logs",
			action: "getLogs",
			...GetLogsParams.parse(params),
			...LogPaginationOptions.parse(options),
		});
		return z.array(Log).parse(response);
	}

	/**
	 * Returns the number of most recent block
	 * @returns block number
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber | `eth_getBlockByNumber`} documentation
	 */
	async getBlockNumber() {
		const response = await this.callJsonRpc({
			action: "eth_blockNumber",
		});
		return Integer.parse(response);
	}

	/**
	 * Returns information about a block by block number.
	 * @param block - block number or tag
	 * @returns `Block` object
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber | `eth_getBlockByNumber`} documentation
	 */
	async getBlock(block: BlockIdentifier) {
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getBlockByNumber",
			tag: ensureBlockIdentifier(block),
			boolean: "false",
		});
		return Block.parse(response);
	}

	/**
	 * Returns information about a block by block number.
	 *
	 * @param block - block number or tag
	 * @returns `BlockWithTransactions` object
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber | `eth_getBlockByNumber`} documentation
	 */
	async getBlockWithTransactions(block: BlockIdentifier) {
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getBlockByNumber",
			tag: ensureBlockIdentifier(block),
			boolean: "true",
		});
		return BlockWithTransactions.parse(response);
	}

	/**
	 * Returns information about a uncle block by block number or tag.
	 *
	 * @param block - block number or tag
	 * @returns `UncleBlock` object
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getunclebyblocknumberandindex | `eth_getUncleByBlockNumberAndIndex`} documentation
	 */
	async getUncleBlock(block: BlockIdentifier, index: number) {
		const idx = Integer.min(0).parse(index);
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getUncleByBlockNumberAndIndex",
			tag: ensureBlockIdentifier(block),
			index: `0x${idx.toString(16)}`,
		});
		return UncleBlock.parse(response);
	}

	/**
	 * Returns the number of transactions by a block number or tag.
	 *
	 * @param block - block number or tag
	 * @returns number of transactions
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbynumber | `eth_getBlockTransactionCountByNumber`} documentation
	 */
	async getBlockTransactionCount(block: BlockIdentifier) {
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getBlockTransactionCountByNumber",
			tag: ensureBlockIdentifier(block),
		});
		return Integer.parse(response);
	}

	/**
	 * Returns the number of transactions by a block number or tag.
	 *
	 * @param block - block number or tag
	 * @returns number of transactions
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyhash | `eth_getTransactionByHash`} documentation
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyblocknumberandindex | `eth_getTransactionByBlockNumberAndIndex`} documentation
	 */
	async getTransaction(params: GetTransactionParams) {
		const txParams = GetTransactionParams.parse(params);
		if ("hash" in txParams) {
			const response = await this.callJsonRpc({
				module: "proxy",
				action: "eth_getTransactionByHash",
				txhash: txParams.hash,
			});
			return EipTransaction.parse(response);
		}
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getTransactionByBlockNumberAndIndex",
			tag: ensureBlockIdentifier(txParams.block),
			index: `0x${txParams.index.toString(16)}`,
		});
		return EipTransaction.parse(response);
	}

	/**
	 * Returns the number of transactions performed by an address.
	 *
	 * @param address - address to get transaction count
	 * @param tag -  pre-defined block parameter, either `"earliest"`, `"pending"` or `"latest"`
	 * @returns number of transactions
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount | `eth_getTransactionCount`} documentation
	 */
	async getAccountTransactionCount(address: string, tag?: Tag) {
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getTransactionCount",
			address: Address.parse(address),
			tag: Tag.default("latest").parse(tag),
		});
		return Integer.parse(response);
	}

	/**
	 * Returns the receipt of a transaction by transaction hash.
	 *
	 * @param txHash - hash of the transaction
	 * @returns `TransactionReceipt`
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionreceipt | `eth_getTransactionReceipt`} documentation
	 */
	async getTransactionReceipt(txHash: string) {
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getTransactionReceipt",
			txhash: HexString.parse(txHash),
		});
		return TransactionReceipt.parse(response);
	}

	/**
	 * Executes a new message call immediately without creating a transaction on the block chain.
	 *
	 * @param params - `CallParams` object
	 * @param tag -  pre-defined block parameter, either `"earliest"`, `"pending"` or `"latest"`
	 * @returns result of the call in hex
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call | `eth_call`} documentation
	 */
	async call(params: CallParams, tag?: Tag) {
		const { value, gas, gasPrice, ...rest } = CallParams.parse(params);
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_call",
			value: value ? `0x${value.toString(16)}` : undefined,
			gas: gas ? `0x${gas.toString(16)}` : undefined,
			gasPrice: gasPrice ? `0x${gasPrice.toString(16)}` : undefined,
			tag: Tag.default("latest").parse(tag),
			...rest,
		});
		return HexValue.parse(response);
	}

	/**
	 * Returns code at a given address.
	 *
	 * @param address - address to get code
	 * @param tag -  pre-defined block parameter, either `"earliest"`, `"pending"` or `"latest"`
	 * @returns bytecode at address
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode | `eth_getCode`} documentation
	 */
	async getCode(address: string, tag?: Tag) {
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_getCode",
			address: Address.parse(address),
			tag: Tag.default("latest").parse(tag),
		});
		return HexString.parse(response);
	}

	/**
	 * Returns the current price per gas in wei.
	 *
	 * @returns gas price in wei
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice | `eth_gasPrice`} documentation
	 */
	async getGasPrice() {
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_gasPrice",
		});
		return Wei.parse(response);
	}

	/**
	 * Makes a call or transaction, which won't be added to the blockchain and returns the used gas.
	 *
	 * @param callParams - `EstimateGasParams` object
	 * @returns gas used
	 *
	 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas | `eth_estimateGas`} documentation
	 */
	async estimateGas(callParams: CallParams) {
		const { value, gas, gasPrice, ...params } = CallParams.parse(callParams);
		const response = await this.callJsonRpc({
			module: "proxy",
			action: "eth_estimateGas",
			value: value ? `0x${value.toString(16)}` : undefined,
			gas: gas ? `0x${gas.toString(16)}` : undefined,
			gasPrice: gasPrice ? `0x${gasPrice.toString(16)}` : undefined,
			...params,
		});
		return Wei.parse(response);
	}

	/**
	 * Returns the current amount of an ERC-20 token in circulation.
	 *
	 * @param contractAddress - contract address
	 * @returns total supply of the ERC20 token
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/tokens#get-erc20-token-totalsupply-by-contractaddress | Etherscan API docs}
	 */
	async getErc20TokenSupply(contractAddress: string) {
		const response = await this.callApi({
			module: "stats",
			action: "tokensupply",
			contractaddress: Address.parse(contractAddress),
		});
		return Wei.parse(response);
	}

	/**
	 * Returns the balance of an ERC-20 token for a given address.
	 *
	 * @param params - {@link GetErc20BalanceParams | `GetErc20BalanceParams`} object
	 * @returns balance of the
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/accounts#get-erc20-token-balance-for-address | Etherscan API docs}
	 */
	async getErc20TokenBalance(params: GetErc20BalanceParams) {
		const { address, contractAddress } = GetErc20BalanceParams.parse(params);
		const response = await this.callApi({
			module: "account",
			action: "tokenbalance",
			address,
			contractaddress: contractAddress,
		});
		return Wei.parse(response);
	}

	/**
	 * Returns the estimated time, in seconds, for a transaction to be confirmed on the blockchain.
	 * @param gasPrice - price paid per unit of gas, in wei
	 * @returns estimated time in seconds
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/gastracker#get-estimated-confirmation-time | Etherscan API docs}
	 */
	async getEstimatedConfirmationTime(gasPrice: bigint) {
		const response = await this.callApi({
			module: "gastracker",
			action: "gasestimate",
			gasprice: gasPrice.toString(),
		});
		return Integer.parse(response);
	}

	/**
	 * Returns the current 'Safe', 'Proposed' and 'Fast' gas prices.
	 * @returns `GasOracleResponse`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/gastracker#get-gas-oracle | Etherscan API docs}
	 */
	async getGasOracle() {
		const response = await this.callApi({
			module: "gastracker",
			action: "gasoracle",
		});
		return GasOracleResponse.parse(response);
	}

	/**
	 * Returns the current amount of Ether in circulation excluding ETH2 Staking rewards and EIP1559 burnt fees.
	 * @returns Ether supply in wei
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats-1#get-total-supply-of-ether | Etherscan API docs}
	 */
	async getEtherSupply() {
		const response = await this.callApi({
			module: "stats",
			action: "ethsupply",
		});
		return Ether.parse(response);
	}

	/**
	 * Returns the current amount of Ether in circulation, ETH2 Staking rewards, EIP1559 burnt fees, and
	 * total withdrawn ETH from the beacon chain.
	 * @returns supply of Ether and Ether2 in wei
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats-1#get-total-supply-of-ether-2 | Etherscan API docs}
	 */
	async getEther2Supply() {
		const response = await this.callApi({
			module: "stats",
			action: "ethsupply2",
		});
		return Ether2Supply.parse(response);
	}

	/**
	 * Returns the last known price of Ether in USD.
	 * @returns `EtherPriceResponse` object with price in USD
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats-1#get-ether-last-price | Etherscan API docs}
	 */
	async getLastEtherPrice() {
		const response = await this.callApi({
			module: "stats",
			action: "ethprice",
		});
		return EtherPriceResponse.parse(response);
	}

	/**
	 * Returns the size of the Ethereum blockchain, in bytes, over a date range.
	 * @param params - `GetEthereumNodeSizeParams` object
	 * @returns `GetEthereumNodesSizeResponse`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats-1#get-ethereum-nodes-size | Etherscan API docs}
	 */
	async getEthereumNodeSize(params: GetEthereumNodeSizeParams) {
		const { startDate, endDate, clientType, sort, syncMode } =
			GetEthereumNodeSizeParams.parse(params);
		const response = await this.callApi({
			module: "stats",
			action: "chainsize",
			startdate: startDate,
			enddate: endDate,
			clienttype: clientType,
			syncmode: syncMode,
			sort,
		});
		return GetEthereumNodesSizeResponse.parse(response);
	}

	/**
	 * Returns the total number of discoverable Ethereum nodes.
	 * @returns `NodeCount`
	 *
	 * @see {@link https://docs.etherscan.io/api-endpoints/stats-1#get-total-nodes-count | Etherscan API docs}
	 */
	async getNodeCount() {
		const response = await this.callApi({
			module: "stats",
			action: "nodecount",
		});
		return NodeCountResponse.parse(response);
	}

	private async fetch(params: Record<string, Primitive>): Promise<unknown> {
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
