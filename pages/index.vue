<template>
	<div
		class="w-full p-0 h-full flex flex-col bg-wyi justify-center items-center"
	>
		<div
			class="
				w-full
				p-0
				h-full
				flex flex-col
				justify-center
				items-center
				overflow-auto
			"
		>
			<h1
				class="
					text-orange-200
					bg-darkeus
					rounded-lg
					p-2
					m-2
					flex flex-col flex-wrap
					items-center
				"
			>
				<div class="flex flex-row items-center">
					<span class="text-2xl font-body">Cosmos-peg Handshake bridge</span>
				</div>
				<span class="text-white min-w-52 m-2 text-center rounded-md"
					>Bridging HNS to cosmos ecosystem. For IBC, simple trading on DEX-es,
					usage in smart contracts.</span
				>
				<span
					>Warning: <span class="text-red-600">ALPHA</span>, use on your own
					risk!</span
				>
				<span
					>Brought to you with ❤️ by
					<a
						href="https://another.software/?ref=chns"
						target="_blank"
						class="text-orange-500 display-inline-block"
						>Another.Software</a
					>
				</span>
			</h1>

			<span
				class="
					bg-darkeus
					p-2
					m-2
					text-center
					rounded-md
					text-yellow-100
					flex flex-col
					justify-center
				"
			>
				<span class="text-2xl font-body">How it works</span>
				<hr />
				<span class="text-xl font-body mb-2">Wrapping</span>

				<span class="w-full flex justify-center"
					><p class="md:w-1/2 sm:w-full sm:p-1">
						To deposit HNS and get cHNS, you get HNS address assigned to your
						JUNO wallet, and for every HNS that is sent to this address, you
						receive identical number of cHNS cw20 token to your JUNO address.
					</p></span
				>

				<hr />
				<span class="text-xl font-body">Unwrapping</span>
				To get real HNS back, "unwrap" cHNS, you send cHNS to our vault,
				providing HNS address where to withdraw as MEMO.<br />
			</span>
			<div
				class="
					m-2
					bg-darkeus
					text-white
					p-2
					rounded-md
					flex flex-col
					md:w-1/2
					sm:w-full
					items-center
					justify-center
				"
			>
				<span class="text-xl font-body mb-2"
					>Enter your JUNO address to get assigned HNS address</span
				>
				<div class="flex flex-row justify-center w-full">
					<input
						type="text"
						class="w-full p-2 rounded-l-md bg-darkeus text-left outline-none"
						v-model="junoAddress"
						placeholder="JUNO address"
					/>
					<button
						class="
							bg-orange-400
							hover:bg-orange-500
							text-black text-sm
							font-body
							rounded-r-md
							p-1
							outline-none
						"
						@click="getHNSAddress"
					>
						Get HNS address
					</button>
				</div>
				<span
					class="text-xl font-body mb-2 text-center mt-2"
					v-if="hnsAddress.length > 0"
					>HNS address to deposit coins:
					<input
						ref="hnsAddressInput"
						@click="selectAllHNSInput"
						class="bg-darkeus w-full outline-0 p-1 rounded-md text-center"
						:value="hnsAddress"
				/></span>
			</div>
			<div
				class="
					m-2
					bg-darkeus
					text-white
					p-2
					rounded-md
					flex flex-col
					md:w-1/2
					sm:w-full
					items-center
					justify-center
				"
			>
				<span class="text-xl font-body mb-2"
					>Withdraw cHNS to handshake network (unwrap)</span
				>
				<button
					class="
						text-xl
						font-body
						m-2
						bg-orange-400
						text-black
						p-2
						rounded-md
						hover:bg-orange-500
						outline-none
					"
					@click="connectKeplr"
					v-if="keplr !== 'connected'"
				>
					Connect keplr
				</button>
				<form
					v-if="keplr == 'connected'"
					@submit.prevent="withdrawcHNS"
					class="w-full flex flex-col justify-center items-center"
				>
					<input
						required
						type="text"
						class="w-full p-2 rounded-md bg-darkeus text-left outline-none mt-1"
						v-model="hnsWithdrawAddress"
						placeholder="HNS address to withdraw"
					/>
					<input
						type="number"
						required
						class="w-full p-2 rounded-md bg-darkeus text-left outline-none mt-1"
						v-model="hnsWithdrawAmount"
						:placeholder="
							'Amount of HNS to withdraw (you have ' + chnsBalance + ' HNS)'
						"
						:max="chnsBalance"
						:step="0.0001"
					/>
					<button
						type="submit"
						class="p-2 bg-orange-400 rounded-md mt-2 text-black outline-none"
					>
						Withdraw
					</button>
				</form>
			</div>
		</div>
	</div>
</template>

<style>
.bg-wyi {
	background-image: url(~/assets/img/bg-1.svg);

	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-attachment: fixed;
	background-color: #00000000;
	background-blend-mode: multiply;
	backdrop-filter: blur(3px);
	overflow: hidden;
}
.bg-darkeus {
	background-color: #000000cc;
	/* padding */
}
hr {
	background-color: #11111111;
	border-color: #ffffff66;
	margin: 8px;
}
</style>
<script setup>
import { ref } from "vue";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
let junoAddress = ref("");
let hnsAddress = ref("");
let hnsWithdrawAddress = ref("");
let hnsWithdrawAmount = ref("");
let hnsAddressInput = ref(null);
let chnsBalance = ref(0);
let offlineSigner;
let keplr = ref(null);
let cosmJS;
const chainId = "juno-1";
async function connectKeplr() {
	if (keplr.value == false) {
		window.open("https://www.keplr.app/");
	} else if (keplr.value == true) {
		await window.keplr.enable("juno-1");

		offlineSigner = window.keplr.getOfflineSigner(chainId);
		let accounts = await offlineSigner.getAccounts();

		// Initialize the gaia api with the offline signer that is injected by Keplr extension.

		cosmJS = await SigningCosmWasmClient.connectWithSigner(
			"https://rpc-juno.itastakers.com/",
			offlineSigner
		);

		window.keplr.suggestToken(
			"juno-1",
			"juno1ur4jx0sxchdevahep7fwq28yk4tqsrhshdtylz46yka3uf6kky5qllqp4k"
		);

		chnsBalance.value =
			(
				await cosmJS.queryContractSmart(
					"juno1ur4jx0sxchdevahep7fwq28yk4tqsrhshdtylz46yka3uf6kky5qllqp4k",
					{ balance: { address: accounts[0].address } }
				)
			).balance / 1000000;
		window.addEventListener("keplr_keystorechange", async () => {
			let accounts = await offlineSigner.getAccounts();

			// Initialize the gaia api with the offline signer that is injected by Keplr extension.
			SigningCosmWasmClient;
			cosmJS = await SigningCosmWasmClient.connectWithSigner(
				"https://rpc-juno.itastakers.com/",
				offlineSigner
			);
			chnsBalance.value = (
				await cosmJS.queryContractSmart(
					"juno1ur4jx0sxchdevahep7fwq28yk4tqsrhshdtylz46yka3uf6kky5qllqp4k",
					{ balance: { address: accounts[0].address } }
				)
			).balance;
		});
		keplr.value = "connected";
	}
}
let fee = {
	amount: [
		{
			denom: "ujuno",
			amount: "1000",
		},
	],
	gas: "280000",
};
async function withdrawcHNS() {
	let accounts = await offlineSigner.getAccounts();
	console.log(hnsWithdrawAmount);
	await cosmJS.execute(
		accounts[0].address,
		"juno1ur4jx0sxchdevahep7fwq28yk4tqsrhshdtylz46yka3uf6kky5qllqp4k",
		{
			transfer: {
				recipient: "juno12n6jz02rxkec3sc2g4fz3jnppmetw90e7slq6t",
				amount: (hnsWithdrawAmount.value * 1000000).toString(),
			},
		},
		fee,
		hnsWithdrawAddress.value
	);
	alert("Sucessfully withdrew " + hnsWithdrawAmount.value + " HNS");
	chnsBalance.value = (
		await cosmJS.queryContractSmart(
			"juno1ur4jx0sxchdevahep7fwq28yk4tqsrhshdtylz46yka3uf6kky5qllqp4k",
			{ balance: { address: accounts[0].address } }
		)
	).balance;
}
if (!window.keplr) {
	keplr.value = false;
} else {
	keplr.value = true;

	// Enabling before using the Keplr is recommended.
	// This method will ask the user whether to allow access if they haven't visited this website.
	// Also, it will request that the user unlock the wallet if the wallet is locked.

	// You can get the address/public keys by `getAccounts` method.
	// It can return the array of address/public key.
	// But, currently, Keplr extension manages only one address/public key pair.
	// XXX: This line is needed to set the sender address for SigningCosmosClient.
}
async function getHNSAddress() {
	hnsAddress.value = await $fetch(
		"https://chns-api.another.software/assignedAddress/" + junoAddress.value
	);
}
function selectAllHNSInput() {
	hnsAddressInput.value.select();
}
useHead({
	title: "Cosmos-peg Handshake",
	viewport: "width=device-width, initial-scale=1, maximum-scale=1",
	charset: "utf-8",
	meta: [
		{
			name: "description",
			content: "Cosmos-pegged handshake using Another.Software vault.",
		},
	],
});
</script>