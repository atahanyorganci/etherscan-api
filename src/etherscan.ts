import { ethers } from "ethers";
import { z } from "zod";

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

export const addressSchema = z
    .string()
    .refine(ethers.isAddress, {
        message: "Invalid address",
    })
    .transform(value => value.toLowerCase());
export type Address = z.infer<typeof addressSchema>;

export const etherSchema = z.string().transform(ethers.parseEther);
export type Ether = z.infer<typeof etherSchema>;

export const hexEncodedValueSchema = z
    .string()
    .refine(value => value.match(/^0x[0-9a-fA-F]*$/i))
    .transform(value => (value.length === 2 ? undefined : value));
export type HexEncodedValue = z.infer<typeof hexEncodedValueSchema>;

type EndpointParams = { module: string; action: string } & Record<string, string>;

export const enumBooleanSchema = z.enum(["0", "1"]).transform(value => value === "1");
export const optionalStringSchema = z
    .string()
    .transform(value => (value === "" ? undefined : value));

const balanceOptionsSchema = z.object({
    tag: z.enum(["latest", "earliest", "pending"]).optional().default("latest"),
});
export type BalanceOptions = z.infer<typeof balanceOptionsSchema>;

const getBalancesSchema = addressSchema.or(z.array(addressSchema).max(20)).transform(value => {
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
});
const getBalancesResultSchema = z.array(z.object({ account: addressSchema, balance: etherSchema }));

const paginationSchema = z.object({
    startBlock: z.number().int().min(0).optional().default(0),
    endBlock: z.number().int().min(0).optional().default(99999999),
    page: z.number().int().min(1).optional().default(1),
    offset: z.number().int().min(1).max(10000).optional().default(10),
    sort: z.enum(["asc", "desc"]).optional().default("desc"),
});
export type PaginationSchema = Partial<z.infer<typeof paginationSchema>>;

const transactionSchema = z.object({
    blockNumber: z.coerce.number(),
    timeStamp: z.coerce.number().transform(value => new Date(value * 1000)),
    hash: z.string(),
    nonce: z.coerce.number(),
    blockHash: z.string(),
    transactionIndex: z.coerce.number(),
    from: z.string(),
    to: optionalStringSchema,
    value: etherSchema,
    gas: etherSchema,
    gasPrice: etherSchema,
    isError: enumBooleanSchema,
    txreceipt_status: enumBooleanSchema,
    input: hexEncodedValueSchema,
    contractAddress: optionalStringSchema.or(addressSchema),
    cumulativeGasUsed: etherSchema,
    gasUsed: etherSchema,
    confirmations: z.coerce.number(),
    methodId: hexEncodedValueSchema,
    functionName: optionalStringSchema,
});
export type Transaction = z.infer<typeof transactionSchema>;

const internalTransactionSchema = z.object({
    blockNumber: z.coerce.number(),
    timeStamp: z.coerce.number().transform(value => new Date(value * 1000)),
    hash: z.string(),
    from: z.string(),
    to: optionalStringSchema.or(addressSchema),
    value: etherSchema,
    contractAddress: optionalStringSchema.or(addressSchema),
    input: optionalStringSchema.or(hexEncodedValueSchema),
    type: z.enum(["call", "create"]),
    gas: etherSchema,
    gasUsed: etherSchema,
    traceId: z.string(),
    isError: enumBooleanSchema,
    errCode: optionalStringSchema,
});

const internalTransactionByHashSchema = z.object({
    blockNumber: z.coerce.number(),
    timeStamp: z.coerce.number().transform(value => new Date(value * 1000)),
    from: z.string(),
    to: optionalStringSchema.or(addressSchema),
    value: etherSchema,
    contractAddress: optionalStringSchema.or(addressSchema),
    input: optionalStringSchema.or(hexEncodedValueSchema),
    type: z.enum(["call", "create"]),
    gas: etherSchema,
    gasUsed: etherSchema,
    isError: enumBooleanSchema,
    errCode: optionalStringSchema,
});

const erc20TokenTransferSchema = z.object({
    blockNumber: z.coerce.number(),
    timeStamp: z.coerce.number().transform(value => new Date(value * 1000)),
    hash: z.string(),
    nonce: z.coerce.number(),
    blockHash: z.string(),
    from: addressSchema,
    contractAddress: addressSchema,
    to: addressSchema,
    value: etherSchema,
    tokenName: z.string(),
    tokenSymbol: z.string(),
    tokenDecimal: z.coerce.number(),
    transactionIndex: z.coerce.number(),
    gas: etherSchema,
    gasPrice: etherSchema,
    gasUsed: etherSchema,
    cumulativeGasUsed: etherSchema,
    input: z.string(),
    confirmations: z.coerce.number(),
});

const erc721TokenTransferSchema = z.object({
    blockNumber: z.coerce.number(),
    timeStamp: z.coerce.number().transform(value => new Date(value * 1000)),
    hash: z.string(),
    nonce: z.coerce.number(),
    blockHash: z.string(),
    from: addressSchema,
    contractAddress: addressSchema,
    to: addressSchema,
    tokenID: z.string(),
    tokenName: z.string(),
    tokenSymbol: z.string(),
    tokenDecimal: z.literal("0"),
    transactionIndex: z.coerce.number(),
    gas: etherSchema,
    gasPrice: etherSchema,
    gasUsed: etherSchema,
    cumulativeGasUsed: etherSchema,
    input: z.string(),
    confirmations: z.coerce.number(),
});

const erc1155TokenTransferSchema = z.object({
    blockNumber: z.coerce.number().int(),
    timeStamp: z.coerce.number().transform(value => new Date(value * 1000)),
    hash: z.string(),
    nonce: z.coerce.number(),
    blockHash: z.string(),
    transactionIndex: z.coerce.number(),
    gas: z.coerce.bigint(),
    gasPrice: z.coerce.bigint(),
    gasUsed: z.coerce.bigint(),
    cumulativeGasUsed: z.coerce.bigint(),
    input: z.string(),
    contractAddress: z.string(),
    from: z.string(),
    to: z.string(),
    tokenID: z.string(),
    tokenValue: etherSchema,
    tokenName: z.string(),
    tokenSymbol: z.string(),
    confirmations: z.coerce.number(),
});

const validatedBlockOptionsSchema = z.object({
    blockType: z.enum(["blocks", "uncles"]).default("blocks"),
    page: z.number().int().min(1).default(1),
    offset: z.number().int().min(1).max(10000).default(10),
});
export type ValidatedBlockOptions = Partial<z.infer<typeof validatedBlockOptionsSchema>>;

const validatedBlockSchema = z.object({
    blockNumber: z.coerce.number(),
    timeStamp: z.coerce.number().transform(value => new Date(value * 1000)),
    blockReward: z.coerce.bigint(),
});

const MultiFileSourceCodeSchema = z
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

export const SourceCodeSchema = z
    .object({
        SourceCode: MultiFileSourceCodeSchema.or(z.string()),
        ABI: z.string(),
        ContractName: z.string(),
        CompilerVersion: z.string(),
        OptimizationUsed: enumBooleanSchema,
        Runs: z.coerce.number(),
        ConstructorArguments: z.string(),
        EVMVersion: z.string(),
        Library: z.string(),
        LicenseType: z.string(),
        Proxy: enumBooleanSchema,
        Implementation: optionalStringSchema,
        SwarmSource: optionalStringSchema,
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

const NotContract = z
    .object({
        ABI: z.string(),
    })
    .refine(value => value.ABI === "Contract source code not verified")
    .transform(() => undefined);

const SourceCodeResponseSchema = NotContract.or(SourceCodeSchema);

export type ContractSourceCode = z.infer<typeof SourceCodeSchema>;

export class EtherScanClient {
    constructor(
        private readonly apiKey: string,
        private readonly apiUrl = "https://api.etherscan.io/api"
    ) {}

    async getBalance(address: string, options?: BalanceOptions) {
        const { tag } = balanceOptionsSchema.parse(options ?? {});
        const balance = await this.callApi({
            module: "account",
            action: "balance",
            address,
            tag,
        });
        return etherSchema.parse(balance);
    }

    async getBalances(addresses: string[] | string, options?: BalanceOptions) {
        const { tag } = balanceOptionsSchema.parse(options ?? {});
        const address = getBalancesSchema.parse(addresses).join(",");
        const result = await this.callApi({
            module: "account",
            action: "balancemulti",
            address,
            tag,
        });
        return getBalancesResultSchema.parse(result);
    }

    async getTransactionsByAddress(address: string, options?: PaginationSchema) {
        const { startBlock, endBlock, page, offset, sort } = paginationSchema.parse(options ?? {});
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
        return z.array(transactionSchema).parse(result);
    }

    async getInternalTransactionsByAddress(address: string, options?: PaginationSchema) {
        const { startBlock, endBlock, page, offset, sort } = paginationSchema.parse(options ?? {});
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
        return z.array(internalTransactionSchema).parse(result);
    }

    async getInternalTransactionsByHash(txHash: string) {
        const result = await this.callApi({
            module: "account",
            action: "txlistinternal",
            txhash: txHash,
        });
        return z.array(internalTransactionByHashSchema).parse(result);
    }

    async getTransactionsByBlockRange(
        start: number,
        end: number,
        options?: Omit<PaginationSchema, "startBlock" | "endBlock">
    ) {
        const { startBlock, endBlock, offset, page, sort } = paginationSchema.parse({
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
        return z.array(internalTransactionSchema).parse(result);
    }

    async getERC20TokenTransfersByAddress(
        contractAddress: string,
        address: string,
        options?: PaginationSchema
    ) {
        contractAddress = addressSchema.parse(contractAddress);
        address = addressSchema.parse(address);
        const { startBlock, endBlock, page, offset, sort } = paginationSchema.parse(options ?? {});
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
        return z.array(erc20TokenTransferSchema).parse(result);
    }

    async getERC721TokenTransfersByAddress(
        contractAddress: string,
        address: string,
        options?: PaginationSchema
    ) {
        contractAddress = addressSchema.parse(contractAddress);
        address = addressSchema.parse(address);
        const { startBlock, endBlock, page, offset, sort } = paginationSchema.parse(options ?? {});
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
        return z.array(erc721TokenTransferSchema).parse(result);
    }

    async getERC1155TokenTransfersByAddress(
        contractAddress: string,
        address: string,
        options?: PaginationSchema
    ) {
        contractAddress = addressSchema.parse(contractAddress);
        address = addressSchema.parse(address);
        const { startBlock, endBlock, page, offset, sort } = paginationSchema.parse(options ?? {});
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
        return z.array(erc1155TokenTransferSchema).parse(result);
    }

    async getBlocksValidatedByAddress(address: string, options?: ValidatedBlockOptions) {
        const { blockType, page, offset } = validatedBlockOptionsSchema.parse(options ?? {});
        const result = await this.callApi({
            module: "account",
            action: "getminedblocks",
            address,
            blocktype: blockType,
            page: page.toString(),
            offset: offset.toString(),
        });
        return z.array(validatedBlockSchema).parse(result);
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
        return z.array(SourceCodeResponseSchema).parse(response);
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
