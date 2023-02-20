# How to Run Subgraph Locally

## In the Credit-Default-Swaps-Contracts Repo

1. Run the local forked mainnet node by executing `npm run node`.
2. In a different window, deploy the contracts to the local node by executing `npm run deploy:mainnet_forked`.

## In the Subgraph Repo

1. Add deployed address to `subgraph.yaml`.
2. Open your Docker app and run `npm run graph-local`.
3. Generates AssemblyScript types for ABIs and the subgraph schema by executing `npm run codegen`.
4. Registers a subgraph name with on the local graph node by running `npm run create-local`.
5. Deploy the subgraph to the local graph node by running `npm run deploy-local`.
6. Run `npm run graph-local-clean` to clean up the data folder.

# The Local Subgraph Endpoint

http://127.0.0.1:8000/subgraphs/name/credit-default-swaps
