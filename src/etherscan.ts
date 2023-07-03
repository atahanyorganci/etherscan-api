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

type EndpointParams = { module: string; action: string } & Record<string, string>;

const apiBoolean = z.enum(["0", "1"]).transform(value => value === "1");
const apiOptionalString = z.string().transform(value => (value === "" ? undefined : value));

export const SourceCodeSchema = z
    .object({
        SourceCode: z.string(),
        ABI: z.string(),
        ContractName: z.string(),
        CompilerVersion: z.string(),
        OptimizationUsed: apiBoolean,
        Runs: z.coerce.number(),
        ConstructorArguments: z.string(),
        EVMVersion: z.string(),
        Library: z.string(),
        LicenseType: z.string(),
        Proxy: apiBoolean,
        Implementation: apiOptionalString,
        SwarmSource: apiOptionalString,
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

    async getABIForContract(address: Address) {
        return this.callApi<string>({
            module: "contract",
            action: "getabi",
            address,
        });
    }

    async getContractSourceCode(address: Address) {
        const response = await this.callApi<unknown>({
            module: "contract",
            action: "getsourcecode",
            address,
        });
        console.log(response);
        const result = z.array(SourceCodeResponseSchema).parse(response);
        console.log(result);
        return result;
    }

    private callApi<T>(params: EndpointParams): Promise<T> {
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
