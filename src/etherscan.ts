import { ethers } from "ethers";
import { z } from "zod";

/**
 * Boolean represented as a string `"0"` or `"1"`
 */
export const EnumBoolean = z.enum(["0", "1"]).transform(value => value === "1");

/**
 * Optional string represented as an empty string `""` or a non-empty string
 */
export const OptionalString = z.string().transform(value => (value === "" ? undefined : value));

/**
 * Address represented as a string with a `0x` prefix followed by 40 hexadecimal characters
 * @example `"0x0000000000000000000000000000000000000000"`
 * @example `"0xBf1345f1b27A711EB3128288db1783DB19027DA2"`
 */
export const Address = z
    .string()
    .refine(ethers.isAddress, {
        message: "Invalid address",
    })
    .transform(value => value.toLowerCase());
export type Address = z.infer<typeof Address>;

/**
 * Address represented as a string with a `0x` prefix followed by 40 hexadecimal characters or an empty string
 */
export const AddressOrEmpty = Address.or(z.string().refine(value => value === ""));

/**
 * Ether value with 18 decimal places represented as a string
 * @example `"1.0"` is parsed as  `1000000000000000000n` wei
 */
export const Ether = z.string().transform(ethers.parseEther);
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
const BigInt = z.coerce.bigint();

type SuccessResponse<T> = {
    status: "1";
    message: "OK";
    result: T;
};

type ErrorResponse = {
    status: "0";
    message: "NOTOK";
    result: string;
};

type Response<T> = SuccessResponse<T> | ErrorResponse;
type EndpointParams = { module: string; action: string } & Record<string, string>;

const BalanceOptions = z.object({
    tag: z.enum(["latest", "earliest", "pending"]).optional().default("latest"),
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
    startBlock: Integer.min(0).default(0),
    endBlock: Integer.min(0).default(99999999),
    page: Integer.min(1).default(1),
    offset: Integer.min(1).max(10000).default(10),
    sort: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationOptions = Partial<z.infer<typeof PaginationOptions>>;

const LogPaginationOptions = z.object({
    fromBlock: Integer.min(0).default(0),
    toBlock: Integer.min(0).default(99999999),
    page: Integer.min(1).default(1),
    offset: Integer.min(1).max(10000).default(10),
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
    to: AddressOrEmpty,
    value: Ether,
    gas: BigInt,
    gasPrice: BigInt,
    isError: EnumBoolean,
    txreceipt_status: EnumBoolean,
    input: HexValue,
    contractAddress: AddressOrEmpty,
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
    to: AddressOrEmpty,
    value: Ether,
    contractAddress: AddressOrEmpty,
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
    to: AddressOrEmpty,
    value: Ether,
    contractAddress: AddressOrEmpty,
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
                    Object.entries(sources).map(([name, { content }]) => ({ name, content }))
                ),
            settings: z.object({}).passthrough().optional(),
        })
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
        })
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
            .transform(({ blockreward, ...rest }) => ({ ...rest, blockReward: blockreward }))
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
        })
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
            .transform(({ operator01, ...rest }) => ({ ...rest, topic0_1_opr: operator01 }))
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
        })
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
        })
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

export class EtherScanClient {
    constructor(
        private readonly apiKey: string,
        private readonly apiUrl = "https://api.etherscan.io/api"
    ) {}

    async getBalance(address: string, options?: BalanceOptions) {
        const { tag } = BalanceOptions.parse(options ?? {});
        const balance = await this.callApi({
            module: "account",
            action: "balance",
            address,
            tag,
        });
        return Ether.parse(balance);
    }

    async getBalances(addresses: string[] | string, options?: BalanceOptions) {
        const { tag } = BalanceOptions.parse(options ?? {});
        const address = GetBalancesInput.parse(addresses).join(",");
        const result = await this.callApi({
            module: "account",
            action: "balancemulti",
            address,
            tag,
        });
        return GetBalancesResult.parse(result);
    }

    async getTransactionsByAddress(address: string, options?: PaginationOptions) {
        const { startBlock, endBlock, page, offset, sort } = PaginationOptions.parse(options ?? {});
        const result = await this.callApi<unknown[]>({
            module: "account",
            action: "txlist",
            address,
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort: sort,
        });
        return z.array(Transaction).parse(result);
    }

    async getInternalTransactionsByAddress(address: string, options?: PaginationOptions) {
        const { startBlock, endBlock, page, offset, sort } = PaginationOptions.parse(options ?? {});
        const result = await this.callApi({
            module: "account",
            action: "txlistinternal",
            address,
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort,
        });
        return z.array(InternalTransaction).parse(result);
    }

    async getInternalTransactionsByHash(txHash: string) {
        const result = await this.callApi({
            module: "account",
            action: "txlistinternal",
            txhash: txHash,
        });
        return z.array(InternalTransactionByHash).parse(result);
    }

    async getTransactionsByBlockRange(
        start: number,
        end: number,
        options?: Omit<PaginationOptions, "startBlock" | "endBlock">
    ) {
        const { startBlock, endBlock, offset, page, sort } = PaginationOptions.parse({
            startBlock: start,
            endBlock: end,
            ...options,
        });
        const result = await this.callApi({
            module: "account",
            action: "txlistinternal",
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            offset: offset.toString(),
            page: page.toString(),
            sort,
        });
        return z.array(InternalTransaction).parse(result);
    }

    async getERC20TokenTransfersByAddress(
        contractAddress: string,
        address: string,
        options?: PaginationOptions
    ) {
        contractAddress = Address.parse(contractAddress);
        address = Address.parse(address);
        const { startBlock, endBlock, page, offset, sort } = PaginationOptions.parse(options ?? {});
        const result = await this.callApi({
            module: "account",
            action: "tokentx",
            contractAddress,
            address,
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort,
        });
        return z.array(ERC20TokenTransfer).parse(result);
    }

    async getERC721TokenTransfersByAddress(
        contractAddress: string,
        address: string,
        options?: PaginationOptions
    ) {
        contractAddress = Address.parse(contractAddress);
        address = Address.parse(address);
        const { startBlock, endBlock, page, offset, sort } = PaginationOptions.parse(options ?? {});
        const result = await this.callApi({
            module: "account",
            action: "tokennfttx",
            contractAddress,
            address,
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort,
        });
        return z.array(ERC721TokenTransfer).parse(result);
    }

    async getERC1155TokenTransfersByAddress(
        contractAddress: string,
        address: string,
        options?: PaginationOptions
    ) {
        contractAddress = Address.parse(contractAddress);
        address = Address.parse(address);
        const { startBlock, endBlock, page, offset, sort } = PaginationOptions.parse(options ?? {});
        const result = await this.callApi({
            module: "account",
            action: "token1155tx",
            contractAddress,
            address,
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort,
        });
        return z.array(ERC1155TokenTransfer).parse(result);
    }

    async getBlocksValidatedByAddress(address: string, options?: GetValidatedBlockOptions) {
        const { blockType, page, offset } = GetValidatedBlockOptions.parse(options ?? {});
        const result = await this.callApi({
            module: "account",
            action: "getminedblocks",
            address,
            blocktype: blockType,
            page: page.toString(),
            offset: offset.toString(),
        });
        return z.array(ValidatedBlock).parse(result);
    }

    async getABIForContract(address: Address) {
        return this.callApi<string>({
            module: "contract",
            action: "getabi",
            address,
        });
    }

    async getContractSourceCode(address: Address) {
        const response = await this.callApi({
            module: "contract",
            action: "getsourcecode",
            address,
        });
        return z.array(ContractSourceCodeResponse).parse(response);
    }

    async getContractCreation(...addresses: Address[]) {
        const contractAddresses = GetContractCreationInput.parse(addresses).join(",");
        const response = await this.callApi({
            module: "contract",
            action: "getcontractcreation",
            contractAddresses,
        });
        return z.array(ContractCreation).parse(response);
    }

    async getContractExecutionStatus(txHash: string) {
        const response = await this.callApi({
            module: "transaction",
            action: "getstatus",
            txhash: txHash,
        });
        return ContractExecutionStatus.parse(response);
    }

    async getTransactionReceiptStatus(txHash: string) {
        const response = await this.callApi({
            module: "transaction",
            action: "gettxreceiptstatus",
            txhash: txHash,
        });
        return TransactionReceiptStatus.parse(response);
    }

    async getBlockAndUncleRewardsByBlockNumber(blockNumber: number) {
        const blockno = Integer.min(0).parse(blockNumber).toString();
        const response = await this.callApi({
            module: "block",
            action: "getblockreward",
            blockno,
        });
        return BlockAndUncleRewards.parse(response);
    }

    async getEstimatedTimeToBlockNo(blockNumber: number) {
        const blockno = Integer.min(0).parse(blockNumber).toString();
        const response = await this.callApi({
            module: "block",
            action: "getblockcountdown",
            blockno,
        });
        return EstimatedTimeToBlockNo.parse(response);
    }

    async getBlockNoByTimestamp(timeStamp: number, closest?: ClosestOption) {
        const timeStampString = Integer.min(0).parse(timeStamp).toString();
        const closestString = ClosestOption.parse(closest);
        const response = await this.callApi({
            module: "block",
            action: "getblocknobytime",
            timestamp: timeStampString,
            closest: closestString,
        });
        return Integer.parse(response);
    }

    async getEventLogsByAddress(address: Address, options?: LogPaginationOptions) {
        address = Address.parse(address);
        const { fromBlock, toBlock, page, offset } = LogPaginationOptions.parse(options ?? {});
        const response = await this.callApi({
            module: "logs",
            action: "getlogs",
            address,
            fromBlock: fromBlock.toString(),
            toBlock: toBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
        });
        return z.array(EventLog).parse(response);
    }

    async getEventLogsByTopics(topics: Topics, options?: LogPaginationOptions) {
        topics = Topics.parse(topics);
        const { fromBlock, toBlock, page, offset } = LogPaginationOptions.parse(options ?? {});
        const response = await this.callApi({
            module: "logs",
            action: "getLogs",
            fromBlock: fromBlock.toString(),
            toBlock: toBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            ...topics,
        });
        return z.array(EventLog).parse(response);
    }

    async getEventLogsByAddressFilteredByTopics(
        address: Address,
        topics: Topics,
        options?: LogPaginationOptions
    ) {
        address = Address.parse(address);
        topics = Topics.parse(topics);
        const { fromBlock, toBlock, page, offset } = LogPaginationOptions.parse(options ?? {});
        const response = await this.callApi({
            module: "logs",
            action: "getLogs",
            address,
            fromBlock: fromBlock.toString(),
            toBlock: toBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            ...topics,
        });
        return z.array(EventLog).parse(response);
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
                })
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

    private callApi<T = unknown>(params: EndpointParams): Promise<T> {
        const endPoint = this.encodeQueryParams({
            ...params,
            apikey: this.apiKey,
        });
        return this.fetch<T>(endPoint);
    }

    private encodeQueryParams(params: Record<string, string>): string {
        const url = new URL(this.apiUrl);
        url.search = new URLSearchParams(params).toString();
        return url.toString();
    }

    private async fetch<T>(url: string): Promise<T> {
        const response = await fetch(url);
        const json = (await response.json()) as Response<T>;
        if (json.status === "0") {
            throw new Error(json.result);
        }
        return json.result;
    }
}
