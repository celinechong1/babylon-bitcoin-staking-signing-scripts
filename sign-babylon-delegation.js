// Signs the unsigned_transaction_serialized from Create Babylon Delegation Tx response
// Usage: node sign-babylon-delegation.js <unsigned_tx_hex> <sequence> <account_number>

const { DirectSecp256k1Wallet, Registry } = require('@cosmjs/proto-signing');
const { SigningStargateClient } = require('@cosmjs/stargate');
const { TxRaw } = require("cosmjs-types/cosmos/tx/v1beta1/tx.js");
const { fromHex } = require("@cosmjs/encoding");
const { MsgCreateBTCDelegation } = require('@babylonlabs-io/babylon-proto-ts/dist/generated/babylon/btcstaking/v1/tx.js');

const BABYLON_PRIVATE_KEY = ''; // UPDATE WITH YOUR BABYLON PRIVATE KEY (64-char hex)

const unsignedTxHex = process.argv[2];
const sequence = parseInt(process.argv[3]);
const accountNumber = parseInt(process.argv[4]);

if (!unsignedTxHex || sequence === undefined || accountNumber === undefined) {
    console.error('Usage: node sign-babylon-delegation.js <unsigned_tx_hex> <sequence> <account_number>');
    process.exit(1);
}

if (!BABYLON_PRIVATE_KEY || BABYLON_PRIVATE_KEY.length !== 64) {
    console.error('Error: Update BABYLON_PRIVATE_KEY in this script');
    process.exit(1);
}

(async () => {
    try {
        const txBuf = Buffer.from(unsignedTxHex, "hex");
        const txJson = JSON.parse(txBuf.toString());

        const msg = MsgCreateBTCDelegation.fromJSON(txJson['messages'][0].value);
        txJson['messages'][0].value = msg;

        const signer = await DirectSecp256k1Wallet.fromKey(fromHex(BABYLON_PRIVATE_KEY), "bbn");
        const { address } = (await signer.getAccounts())[0];

        const registry = new Registry();
        registry.register("/babylon.btcstaking.v1.MsgCreateBTCDelegation", MsgCreateBTCDelegation);

        const signingClient = await SigningStargateClient.offline(signer, { registry });

        const txRaw = await signingClient.sign(
            address,
            txJson.messages,
            txJson.fee,
            txJson.memo,
            { accountNumber, sequence, chainId: 'bbn-test-5' }
        );

        const txBytes = TxRaw.encode(txRaw).finish();
        const signedTransaction = Buffer.from(txBytes).toString('hex');

        console.log('signed_transaction:');
        console.log(signedTransaction);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();