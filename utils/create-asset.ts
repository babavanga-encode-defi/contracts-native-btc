import {
  Account,
  addFeeToTx,
  BitcoinUTXO,
  electrumFetchNonGlittrUtxos,
  GlittrSDK,
  OpReturnMessage,
  Output,
  txBuilder,
} from "@glittr-sdk/sdk";

async function deployFreeMintContract() {
  const NETWORK = "regtest";
  const client = new GlittrSDK({
    network: NETWORK,
    apiKey: "ccc80ba0-e813-41ed-8a62-1ea0560688e7",
    glittrApi: "https://devnet-core-api.glittr.fi", // devnet
    electrumApi: "https://devnet-electrum.glittr.fi", // devnet
  });
  const account = new Account({
    network: NETWORK,
    wif: "cW84FgWG9U1MpKvdzZMv4JZKLSU7iFAzMmXjkGvGUvh5WvhrEASj",
  });

  // Build the tx message
  const tx: OpReturnMessage = {
    contract_creation: {
      contract_type: {
        moa: {
          divisibility: 18,
          live_time: 0,
          supply_cap: "1000000000",
          ticker: "FKBTC",
          mint_mechanism: {
            free_mint: { amount_per_mint: "10", supply_cap: "1000000000" },
          },
        },
      },
    },
  };

  // Helper function to fetch non glittr utxos
  const utxos = await electrumFetchNonGlittrUtxos(
    client,
    account.p2wpkh().address
  );

  const nonFeeInputs: BitcoinUTXO[] = [];

  // Put tx message on output #0
  const nonFeeOutputs: Output[] = [{ script: txBuilder.compile(tx), value: 0 }];

  // Helper function to add UTXO fee into the tx
  const { inputs, outputs } = await addFeeToTx(
    NETWORK,
    account.p2wpkh().address,
    utxos,
    nonFeeInputs,
    nonFeeOutputs
  );

  const txid = await client.createAndBroadcastRawTx({
    account: account.p2wpkh(),
    inputs,
    outputs,
  });

  console.log("TXID:", txid);
}

deployFreeMintContract();
