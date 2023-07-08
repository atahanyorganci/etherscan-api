import serverEnv from "~/env/server";
import { EtherScanClient, addressSchema } from "~/etherscan";
import { type Page } from "~/util";

async function getContract(address: string) {
    const client = new EtherScanClient(serverEnv.ETHERSCAN_API_KEY);
    const result = addressSchema.safeParse(address);
    if (!result.success) {
        throw new Error("Invalid address");
    }
    const [sourceCode] = await client.getContractSourceCode(result.data);
    return {
        address,
        ...sourceCode,
    };
}

type ContractPageProps = {
    address: string;
};

const Contract: Page<ContractPageProps> = async ({ params: { address } }) => {
    const contract = await getContract(address);

    if (!contract) {
        return <main>Contract not found</main>;
    }

    return (
        <main>
            <h1>Contract {contract.name}</h1>
            <div>
                <p>License</p>
                <p>{contract.license}</p>
            </div>
            <div>
                <p>EVM Version</p>
                <p>{contract.evmVersion}</p>
            </div>
            <div>
                <p>Compiler Version</p>
                <p>{contract.compilerVersion}</p>
            </div>
            <div>
                <p>Optimization</p>
                <p>{contract.isOptimized ? `Yes with ${contract.optimizationRuns} runs` : "No"}</p>
            </div>
            <div>
                <p>Runs</p>
                <p>{contract.optimizationRuns}</p>
            </div>
            <h2>Source Code</h2>
            <pre>{JSON.stringify(contract.sourceCode, null, 4)}</pre>
            <div>
                <h2>ABI</h2>
                <pre>{JSON.stringify(JSON.parse(contract.abi ?? ""), null, 4)}</pre>
                {contract.constructorArguments && (
                    <>
                        <h2>Constructor</h2>
                        <pre>{contract.constructorArguments}</pre>
                    </>
                )}
            </div>
        </main>
    );
};

export default Contract;
