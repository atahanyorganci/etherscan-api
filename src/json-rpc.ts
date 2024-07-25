import { z } from "zod";
import {
	Wei as BigInt_,
	Address,
	HexString,
	Integer,
	HexValue,
	OptionalAddress,
	Ether,
	TimeStamp,
	BlockIdentifier,
} from "./core";

export const SignedLegacyTransaction = z.object({
	type: z.literal("0x0"),
	nonce: BigInt_,
	to: Address.or(z.null()),
	gas: BigInt_,
	value: BigInt_,
	input: HexString,
	gasPrice: BigInt_,
	chainId: Integer.optional(),
	v: HexValue,
	r: HexValue,
	s: HexValue,
});
export type SignedLegacyTransaction = z.infer<typeof SignedLegacyTransaction>;

export const Signed2930Transaction = z.object({
	type: z.literal("0x1"),
	blockHash: HexString,
	blockNumber: Integer,
	from: Address,
	gas: BigInt_,
	gasPrice: BigInt_,
	hash: HexString,
	input: HexString,
	nonce: HexString,
	to: OptionalAddress,
	transactionIndex: Integer,
	value: Ether,
	accessList: z.array(
		z.object({
			address: Address,
			storageKeys: z.array(HexString),
		}),
	),
	chainId: Integer,
	v: HexValue,
	r: HexValue,
	s: HexValue,
	yParity: Integer,
});
export type Signed2930Transaction = z.infer<typeof Signed2930Transaction>;

export const Signed1559Transaction = z.object({
	type: z.literal("0x2"),
	blockHash: HexString,
	blockNumber: Integer,
	from: Address,
	gas: BigInt_,
	gasPrice: BigInt_,
	maxFeePerGas: BigInt_,
	maxPriorityFeePerGas: BigInt_,
	hash: HexString,
	input: HexString,
	nonce: Integer,
	to: z
		.null()
		.or(Address)
		.or(OptionalAddress.transform(a => a ?? null)),
	transactionIndex: Integer,
	value: BigInt_,
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
export type Signed1559Transaction = z.infer<typeof Signed1559Transaction>;

export const Signed4844Transaction = z.object({
	type: HexString,
	nonce: HexString,
	to: Address,
	gas: BigInt_,
	value: BigInt_,
	input: z.string(),
	maxPriorityFeePerGas: BigInt_,
	maxFeePerGas: BigInt_,
	maxFeePerBlobGas: BigInt_,
	accessList: z.array(
		z.object({
			address: Address,
			storageKeys: z.array(HexString),
		}),
	),
	blobVersionedHashes: z.array(HexString),
	chainId: Integer,
	yParity: Integer,
	r: z.string(),
	s: z.string(),
});
export type Signed4844Transaction = z.infer<typeof Signed4844Transaction>;

export const EipTransaction = z.discriminatedUnion("type", [
	SignedLegacyTransaction,
	Signed2930Transaction,
	Signed1559Transaction,
]);
export type EipTransaction = z.infer<typeof EipTransaction>;

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
		transactions: z.array(EipTransaction),
		transactionsRoot: HexString,
		uncles: z.array(HexString),
	})
	.or(z.null());

export const GetTransactionInput = z
	.object({
		hash: HexString,
	})
	.or(
		z.object({
			block: BlockIdentifier,
			index: Integer.min(0),
		}),
	);
export type GetTransactionInput = z.infer<typeof GetTransactionInput>;

export const UncleBlock = z.object({
	baseFeePerGas: BigInt_,
	difficulty: BigInt_,
	extraData: HexString,
	gasLimit: BigInt_,
	gasUsed: BigInt_,
	hash: HexString,
	logsBloom: HexString,
	miner: HexString,
	mixHash: HexString,
	nonce: HexString,
	number: BigInt_,
	parentHash: HexString,
	receiptsRoot: HexString,
	sha3Uncles: HexString,
	size: BigInt_,
	stateRoot: HexString,
	timestamp: BigInt_,
	transactionsRoot: HexString,
	uncles: z.array(HexString),
});
export type UncleBlock = z.infer<typeof UncleBlock>;

export const TransactionReceipt = z.object({
	/** The actual value per gas deducted from the sender's account for blob gas. Only specified for blob transactions as defined by EIP-4844. */
	blobGasPrice: BigInt_.optional(),
	/** The amount of blob gas used. Only specified for blob transactions as defined by EIP-4844. */
	blobGasUsed: BigInt_.optional(),
	/** Hash of block containing this transaction */
	blockHash: HexString,
	/** Number of block containing this transaction */
	blockNumber: Integer,
	/** Address of new contract or `null` if no contract was created */
	contractAddress: Address.nullable().optional(),
	/** Gas used by this and all preceding transactions in this block */
	cumulativeGasUsed: BigInt_,
	/** Pre-London, it is equal to the transaction's gasPrice. Post-London, it is equal to the actual gas price paid for inclusion. */
	effectiveGasPrice: BigInt_,
	/** Transaction sender */
	from: Address,
	/** Gas used by this transaction */
	gasUsed: BigInt_,
	/** List of log objects generated by this transaction */
	logs: z.array(
		z.object({
			address: Address,
			topics: z.array(HexString),
			data: HexString,
			blockNumber: Integer,
			transactionHash: HexString,
			transactionIndex: Integer,
			blockHash: HexString,
			logIndex: Integer,
			removed: z.boolean(),
		}),
	),
	/** Logs bloom filter */
	logsBloom: HexString,
	/** The post-transaction state root. Only specified for transactions included before the Byzantium upgrade. */
	root: HexString.optional(),
	/** 0x1 if this transaction was successful or 0x0 if it failed */
	status: Integer.optional(),
	/** Transaction recipient or `null` if deploying a contract */
	to: Address.nullable(),
	/** Hash of this transaction */
	transactionHash: HexString,
	/** Index of this transaction in the block */
	transactionIndex: Integer,
	/** Transaction type */
	type: Integer,
});
export type TransactionReceipt = z.infer<typeof TransactionReceipt>;

/**
 * Call parameters for the `eth_call` JSON-RPC method.
 *
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call}
 */
export const CallParams = z.object({
	from: Address.optional(),
	to: Address,
	gas: BigInt_.optional(),
	gasPrice: BigInt_.optional(),
	value: BigInt_.optional(),
	data: HexString.optional(),
});
export type CallParams = z.infer<typeof CallParams>;
