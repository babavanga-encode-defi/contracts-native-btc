import {
  Account,
  GlittrSDK,
  electrumFetchNonGlittrUtxos,
  txBuilder,
  addFeeToTx,
} from "@glittr-sdk/sdk";

const NETWORK = "regtest";
const API_KEY = "your-api-key";
const WIF = "user-wif-key";

// Initialize the Glittr client and user account.
const client = new GlittrSDK({
  network: NETWORK,
  apiKey: API_KEY,
  glittrApi: "https://devnet-core-api.glittr.fi",
  electrumApi: "https://devnet-electrum.glittr.fi",
});
const userAccount = new Account({ wif: WIF, network: NETWORK });
const userAddress = userAccount.p2tr().address;

async function buyYesTokenWithBTC(
  ammContract,
  swapAmountBTC,
  slippagePercentage
) {
  // Get the current AMM state.
  const contractState = await client.getContractState(
    ammContract[0],
    ammContract[1]
  );
  const assetKeys = Object.keys(contractState.collateralized.amounts);
  const yesAssetKey = assetKeys.find((key) => key.includes("YES"));
  const noAssetKey = assetKeys.find((key) => key.includes("NO"));
  if (!yesAssetKey || !noAssetKey) {
    throw new Error("YES or NO asset not found in AMM contract");
  }
  const inputTotal = parseInt(contractState.collateralized.amounts[noAssetKey]);
  const outputTotal = parseInt(
    contractState.collateralized.amounts[yesAssetKey]
  );
  const outputAmount = Math.floor(
    outputTotal - (inputTotal * outputTotal) / (inputTotal + swapAmountBTC)
  );
  if (outputAmount <= 0) {
    throw new Error("Calculated output amount is 0");
  }
  const minOutput = Math.floor(
    outputAmount - (outputAmount * slippagePercentage) / 100
  );
  console.log(
    `Swapping ${swapAmountBTC} BTC: calculated output = ${outputAmount} YES tokens, with minimum acceptable = ${minOutput}`
  );

  // Build the swap transaction.
  const tx = {
    contract_call: {
      contract: ammContract,
      call_type: {
        swap: {
          pointer: 1,
          assert_values: { min_out_value: minOutput.toString() },
        },
      },
    },
    transfer: {
      transfers: [
        {
          asset: ["BTC", "0"], // BTC asset
          output: 2,
          amount: swapAmountBTC.toString(),
        },
      ],
    },
  };

  // Define fee outputs.
  const nonFeeOutputs = [
    { script: txBuilder.compile(tx), value: 0 }, // OP_RETURN output with tx message.
    { address: userAddress, value: 546 },
    { address: userAddress, value: 546 },
  ];

  // Fetch UTXOs to fund the fee.
  const utxos = await electrumFetchNonGlittrUtxos(
    client.electrumApi,
    API_KEY,
    userAddress
  );
  const nonFeeInputs = []; // leaving empty so fee inputs are selected automatically

  // Use addFeeToTx to get fee inputs and adjusted outputs.
  const { inputs, outputs } = await addFeeToTx(
    NETWORK,
    userAddress,
    utxos,
    nonFeeInputs,
    nonFeeOutputs
  );

  // Broadcast the raw transaction with the fee inputs.
  const txid = await client.createAndBroadcastRawTx({
    account: userAccount.p2tr(),
    inputs,
    outputs,
  });
  console.log(`Swap TXID: ${txid}`);
  console.log("[+] Waiting for swap transaction to be mined...");
  while (true) {
    try {
      const message = await client.getGlittrMessageByTxId(txid);
      console.log("Swap mined:", JSON.stringify(message));
      break;
    } catch (error) {
      await delay(1000);
    }
  }
}

// Example usage
const ammContract = [
  /* AMM contract block and order */
];
const swapAmountBTC = 0.01; // Amount of BTC to swap
const slippagePercentage = 10; // 10% slippage tolerance

buyYesTokenWithBTC(ammContract, swapAmountBTC, slippagePercentage).catch(
  (error) => {
    console.error("Error:", error);
  }
);
