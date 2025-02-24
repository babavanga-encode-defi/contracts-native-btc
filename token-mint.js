import { Account, GlittrSDK, GlittrTransaction } from "@glittr-sdk/sdk";

async function deployFreeMintContract() {
  const NETWORK = "regtest";
  const client = new GlittrSDK({
    network: NETWORK,
    apiKey: "your-api-key",
    glittrApi: "https://devnet-core-api.glittr.fi", // devnet
    electrumApi: "https://devnet-electrum.glittr.fi", // devnet
  });
  const account = new Account({
    network: NETWORK,
    wif: "cSYKWxFZ3PXnwFFqVVEu2hCZuF7b3GfhcrZCfMcaqqt3CFeYESU6",
  });
  const transaction = new GlittrTransaction({
    client,
    account,
  });

  const txid = await transaction.contractDeployment.freeMint(
    "test1", // ticker
    18, // divisibility
    "1", // amount per mint
    "1000000" // supply cap
  );

  console.log("TXID : ", txid);
}

deployFreeMintContract();
