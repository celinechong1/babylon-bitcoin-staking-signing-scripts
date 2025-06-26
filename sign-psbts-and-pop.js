// Signs PSBTs and Proof of Possession from Create Stake Intent response
// Usage: node sign-psbts-and-pop.js

const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');
const crypto = require('crypto');

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const WIF = ''; // UPDATE WITH YOUR BITCOIN WIF
const SLASHING_PSBT = ''; // UPDATE WITH SLASHING_PSBT FROM API RESPONSE
const UNBONDING_PSBT = ''; // UPDATE WITH UNBONDING_SLASHING_PSBT FROM API RESPONSE
const BABYLON_ADDRESS = ''; // UPDATE WITH PROOF_OF_OWNERSHIP FROM API RESPONSE

const keyPair = ECPair.fromWIF(WIF, bitcoin.networks.testnet);

// Sign PSBT
function signPSBT(psbtHex) {
    const psbt = bitcoin.Psbt.fromHex(psbtHex);
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    return psbt.toHex();
}

// Sign Proof of Possession using BIP340 (Schnorr) method
function signProofOfPossession(babylonAddress) {
    const addressBytes = Buffer.from(babylonAddress, 'utf8');
    const messageHash = crypto.createHash('sha256').update(addressBytes).digest();

    let signature;
    if (ecc.signSchnorr) {
        signature = ecc.signSchnorr(messageHash, keyPair.privateKey);
    } else {
        signature = ecc.sign(messageHash, keyPair.privateKey);
    }

    return Buffer.from(signature).toString('base64');
}

const signedSlashing = signPSBT(SLASHING_PSBT);
const signedUnbonding = signPSBT(UNBONDING_PSBT);
const signedPoP = signProofOfPossession(BABYLON_ADDRESS);

// Output results for API call
console.log('signed_slashing_psbt:');
console.log(signedSlashing);
console.log('\nsigned_unbonding_slashing_psbt:');
console.log(signedUnbonding);
console.log('\nsigned_proof_of_possession:');
console.log(signedPoP);

module.exports = {
    signPSBT,
    signProofOfPossession
};