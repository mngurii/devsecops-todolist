import { ethers } from "ethers";

const RPC_URL = "http://host.docker.internal:7545";
const PRIVATE_KEY = "0xb832d2822926f74841a713d94bf4b6f02f12b82143fe493d16bf7e7161d96782";
const CONTRACT_ADDRESS = "0x8B678747978cd69ebc9214B6E436Cb87283DeB78";

const ABI = [
  "function addLog(string memory _hash) public"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

export default contract;

async function testBlockchain() {
  try {
    const tx = await contract.addLog("TEST_LOG_HASH");

    console.log("Transaction sent!");
    console.log("TX Hash:", tx.hash);

    await tx.wait();

    console.log("Data berhasil masuk blockchain!");
  } catch (err) {
    console.error(err);
  }
}

testBlockchain();
