// Check Babylon account number and sequence
// Usage: node check-account.js 

const { StargateClient } = require('@cosmjs/stargate');

const BABYLON_ADDRESS = ''; // UPDATE WITH YOUR BABYLON ADDRESS

const addressToCheck = process.argv[2] || BABYLON_ADDRESS;

if (!addressToCheck) {
    console.error('Usage: node check-account.js');
    process.exit(1);
}

(async () => {
    try {
        const client = await StargateClient.connect('https://babylon-testnet-rpc.polkachu.com');
        const account = await client.getAccount(addressToCheck);

        if (account) {
            console.log('Account Number:', account.accountNumber);
            console.log('Sequence:', account.sequence);
        } else {
            console.log('Account not found');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
})();