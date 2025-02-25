import { Account, GlittrSDK } from "@glittr-sdk/sdk";
const NETWORK = "regtest";
const client = new GlittrSDK({
    network: NETWORK,
    apiKey: "ccc80ba0-e813-41ed-8a62-1ea0560688e7",
    glittrApi: "https://devnet-core-api.glittr.fi", // devnet
    electrumApi: "https://devnet-electrum.glittr.fi", // devnet
});
const creatorAccount = new Account({
    wif: "cSYKWxFZ3PXnwFFqVVEu2hCZuF7b3GfhcrZCfMcaqqt3CFeYESU6",
    network: NETWORK,
});
async function deployContract() {
    const tx = {
        contract_creation: {
            contract_type: {
                moa: {
                    ticker: "FIRST", // change this ticker
                    divisibility: 18,
                    live_time: 0,
                    mint_mechanism: {
                        free_mint: {
                            amount_per_mint: BigInt(100000).toString(),
                        },
                    },
                },
            },
        },
    };
    const txid = await client.createAndBroadcastTx({
        account: creatorAccount.p2tr(),
        tx: tx,
    });
    console.log(`TXID : ${txid}`);
    console.log("[+] Waiting to be mined");
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const message = await client.getGlittrMessageByTxId(txid);
            console.log("Mined! Response", JSON.stringify(message));
            break;
        }
        catch (error) {
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    }
}
deployContract();
