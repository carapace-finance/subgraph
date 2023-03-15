# How to Run Subgraph Locally

## In the Credit-Default-Swaps-Contracts Repo

1. Run the local hardhat node (without mainnet forking) by executing `npm run node:0` in a terminal.
2. In a different terminal, deploy the contracts to the local node by executing `npm run deploy-mock-and-setup:localhost`.
   <br> This should also setup the test transactions for the local subgraph dev.

## In the Subgraph Repo

3. Add/update addresses to `subgraph.yaml` for all deployed contracts with subgraph mappings.
4. Also, update the block number where the contracts were deployed in the `subgraph.yaml`.
5. Start the docker app and run `npm run graph-local` in new terminal to start the local graph node.
6. Open another terminal window and generate AssemblyScript types for ABIs and the subgraph schema by executing `npm run codegen`.
7. Registers a subgraph name with on the local graph node by running `npm run create-local`.
8. Deploy the subgraph to the local graph node by running `npm run deploy-local`.

## Data Cleanup

If for any reason you stop the hardhat node, it is recommended to stop the graph node, delete the ipfs and postgres folders in data (or the whole data folder) created by the graph node.
You can `run npm run graph-local-clean` that will do that for you and then repeat steps 1-8.

# The Local Subgraph Endpoint

http://localhost:8000/subgraphs/name/carapace
