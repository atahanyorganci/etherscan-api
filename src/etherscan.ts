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
