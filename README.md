# Babylon Bitcoin Staking - Signing Scripts

Signing scripts for Babylon Bitcoin staking PSBTs and delegation transactions.

## Files

- `sign-psbts-and-pop.js` - Signs PSBTs and Proof of Possession
- `sign-babylon-delegation.js` - Signs Babylon delegation transaction
- `check-account.js` - Check Babylon account number and sequence

## Setup

```bash
npm install
```

## Usage

### 0. Check Account Info (Optional)

Get your Babylon account number and sequence:

update `BABYLON_ADDRESS` in `check-account.js` and run:

```bash
node check-account.js
```

### 1. Sign PSBTs and Proof of Possession

**Update these values in `sign-psbts-and-pop.js`:**

- `WIF` - Your Bitcoin private key (WIF format)
- `SLASHING_PSBT` - From Create Stake Intent API response
- `UNBONDING_PSBT` - From Create Stake Intent API response
- `BABYLON_ADDRESS` - From Create Stake Intent API response

```bash
npm run sign-psbts
```

Outputs: `signed_slashing_psbt`, `signed_unbonding_slashing_psbt`, `signed_proof_of_possession`

### 2. Sign Babylon Delegation Transaction

**Update this value in `sign-babylon-delegation.js`:**

- `BABYLON_PRIVATE_KEY` - Your Babylon private key (64-char hex)

```bash
npm run sign-delegation <unsigned_tx_hex> <sequence> <account_number>
```

Outputs: `signed_transaction`
