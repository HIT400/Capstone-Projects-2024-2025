const TendekoEProcurement = artifacts.require("TendekoEProcurement");
const DataVerification = artifacts.require("DataVerification");

module.exports = async function (deployer, network, accounts) {
  const adminAddress = accounts[0];

  await deployer.deploy(TendekoEProcurement, adminAddress);
  await deployer.deploy(DataVerification);
};
