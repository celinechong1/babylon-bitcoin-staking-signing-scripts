const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');
const crypto = require('crypto');

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

// Update with own values
const PRIVATE_KEY_WIF = '';
const STAKER_PUBLIC_KEY = ''; 
const STAKER_BTC_ADDRESS = ''; 
const BABYLON_ADDRESS = ''; 

// Create key pair from WIF
const keyPair = ECPair.fromWIF(PRIVATE_KEY_WIF, bitcoin.networks.testnet);

// Tendermint hash function
function tmhash(data) {
    return crypto.createHash('sha256').update(data).digest();
}

// Method 1: BIP340 (Schnorr)
function signProofOfPossession_Method1_BIP340(babylonAddress, keyPair, stakerPublicKey) {
    const addressBytes = Buffer.from(babylonAddress, 'utf8');
    const hash = tmhash(addressBytes);
    const schnorrSig = ecc.signSchnorr(hash, keyPair.privateKey);
    return Buffer.from(schnorrSig).toString('base64');
}

// Method 2: ECDSA 
function signProofOfPossession_Method2_ECDSA(babylonAddress, keyPair, stakerPublicKey) {
    const addressBytes = Buffer.from(babylonAddress, 'utf8');
    const addrHex = addressBytes.toString('hex');
    const hexHash = crypto.createHash('sha256').update(Buffer.from(addrHex, 'utf8')).digest();
    const ecdsaSig = ecc.sign(hexHash, keyPair.privateKey);
    return Buffer.from(ecdsaSig).toString('base64');
}

// Method 3: BIP322 
function signProofOfPossession_Method3_BIP322(babylonAddress, keyPair, stakerPublicKey, stakerBtcAddress) {
    const addressBytes = Buffer.from(babylonAddress, 'utf8');
    const msgToSign = tmhash(addressBytes);
    const witnessSignature = ecc.signSchnorr(msgToSign, keyPair.privateKey);

    const bip322Sig = {
        address: stakerBtcAddress,           
        sig: witnessSignature               
    };

    
    const addressBytes_encoded = Buffer.from(bip322Sig.address, 'utf8');
    const sigBytes = Buffer.from(bip322Sig.sig);

    const addressLengthBytes = Buffer.alloc(4);
    addressLengthBytes.writeUInt32LE(addressBytes_encoded.length, 0);

    const sigLengthBytes = Buffer.alloc(4);
    sigLengthBytes.writeUInt32LE(sigBytes.length, 0);

    const encodedProtobuf = Buffer.concat([
        addressLengthBytes,
        addressBytes_encoded,
        sigLengthBytes,
        sigBytes
    ]);

    return encodedProtobuf.toString('base64');
}

// Execute all methods 
console.log('Method 1 (BIP340/Schnorr):', signProofOfPossession_Method1_BIP340(BABYLON_ADDRESS, keyPair, STAKER_PUBLIC_KEY));
console.log('Method 2 (ECDSA):', signProofOfPossession_Method2_ECDSA(BABYLON_ADDRESS, keyPair, STAKER_PUBLIC_KEY));
console.log('Method 3 (BIP322):', signProofOfPossession_Method3_BIP322(BABYLON_ADDRESS, keyPair, STAKER_PUBLIC_KEY, STAKER_BTC_ADDRESS));

module.exports = {
    signProofOfPossession_Method1_BIP340,
    signProofOfPossession_Method2_ECDSA,
    signProofOfPossession_Method3_BIP322,
    tmhash
};
