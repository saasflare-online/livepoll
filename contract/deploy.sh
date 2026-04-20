#!/bin/bash

# LivePoll Soroban Deployment Helper
# This script builds and deploys the poll contract to Stellar Testnet

set -e

echo "🚀 Building contract..."
cargo build --target wasm32-unknown-unknown --release

WASM_FILE="target/wasm32-unknown-unknown/release/live_poll.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo "❌ Build failed: WASM file not found at $WASM_FILE"
    exit 1
fi

echo "📦 Optimizing contract..."
# Using stellar cli's built-in optimization if available, or just keeping the release build
# stellar contract optimize --wasm $WASM_FILE

echo "🌐 Deploying to Testnet..."
# This requires the user to have a 'testnet' network and 'admin' identity configured in stellar cli
# If not configured, we'll suggest how to do it.

DEPLOY_CMD="stellar contract deploy --wasm $WASM_FILE --source-account admin --network testnet"

echo "Attempting: $DEPLOY_CMD"
CONTRACT_ID=$(stellar contract deploy --wasm "$WASM_FILE" --source-account admin --network testnet 2>/dev/null || echo "FAILED")

if [ "$CONTRACT_ID" == "FAILED" ]; then
    echo ""
    echo "❌ Deployment failed."
    echo "Ensure you have configured the Stellar CLI:"
    echo "1. Add Testnet: stellar network add --rpc-url https://soroban-testnet.stellar.org --network-passphrase 'Test SDF Network ; September 2015' testnet"
    echo "2. Add Admin Identity: stellar keys generate --network testnet admin"
    echo "3. Fund Admin: Go to https://laboratory.stellar.org/#account-creator and fund your admin address"
    exit 1
fi

echo "✅ SUCCESS! Contract Deployed."
echo "New Contract ID: $CONTRACT_ID"
echo ""
echo "Next Steps:"
echo "1. Update 'CONTRACT_ID' in 'src/lib/constants.ts' with the ID above."
echo "2. Restart your development server."
echo "3. Visit /admin to initialize your new poll."
