async function main() {
  const AuditLog = await ethers.getContractFactory("AuditLog");
  const contract = await AuditLog.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});