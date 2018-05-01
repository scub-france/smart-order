module.exports = {
	// contracts_build_directory: "../../data/contracts",
	networks: {
		devnet: {
			host: 'localhost',
			port: 9545,
			network_id: '*'
		},
		testnet: {
			host: 'ganache-cli',
			port: 8545,
			network_id: '*'
			// optional config values:
			// gas
			// gasPrice
			// from - default address to use for any transaction Truffle makes during migrations
			// provider - web3 provider instance Truffle should use to talk to the Ethereum network.
			//          - function that returns a web3 provider instance (see below.)
			//          - if specified, host and port are ignored.
		},
	},
	mocha: {
		useColors: true
	},
	solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	}
}
