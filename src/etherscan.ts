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
    startBlock: z.number().int().min(0).optional().default(0),
    endBlock: z.number().int().min(0).optional().default(99999999),
    page: z.number().int().min(1).optional().default(1),
    offset: z.number().int().min(1).max(10000).optional().default(10),
    sort: z.enum(["asc", "desc"]).optional().default("desc"),
});
export type PaginationOptions = Partial<z.infer<typeof PaginationOptions>>;

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
