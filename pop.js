const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');
const crypto = require('crypto');

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

// Method 1: SHA256 hash + Schnorr (BIP340)
function signProofOfPossession_Method1(babylonAddress, keyPair) {
    const addressBytes = Buffer.from(babylonAddress, 'utf8');
    const messageHash = crypto.createHash('sha256').update(addressBytes).digest();
    const schnorrSig = ecc.signSchnorr(messageHash, keyPair.privateKey);
    return Buffer.from(schnorrSig).toString('base64');
}

// Method 2: Hex encoded message + ECDSA
function signProofOfPossession_Method2(babylonAddress, keyPair) {
    const hexEncodedMessage = Buffer.from(babylonAddress, 'utf8').toString('hex');
    const hexMessageHash = crypto.createHash('sha256').update(Buffer.from(hexEncodedMessage, 'hex')).digest();
    const ecdsaSig = ecc.sign(hexMessageHash, keyPair.privateKey);
    return Buffer.from(ecdsaSig).toString('base64');
}

// Method 3: Direct message + ECDSA
function signProofOfPossession_Method3(babylonAddress, keyPair) {
    const addressBytes = Buffer.from(babylonAddress, 'utf8');
    const directHash = crypto.createHash('sha256').update(addressBytes).digest();
    const directSig = ecc.sign(directHash, keyPair.privateKey);
    return Buffer.from(directSig).toString('base64');
}

// Combined function that returns all three methods
function signProofOfPossession_AllMethods(babylonAddress, keyPair) {
    return {
        method1_schnorr: signProofOfPossession_Method1(babylonAddress, keyPair),
        method2_ecdsa_hex: signProofOfPossession_Method2(babylonAddress, keyPair),
        method3_ecdsa_direct: signProofOfPossession_Method3(babylonAddress, keyPair)
    };
}

module.exports = {
    signProofOfPossession_Method1,
    signProofOfPossession_Method2,
    signProofOfPossession_Method3,
    signProofOfPossession_AllMethods
};
