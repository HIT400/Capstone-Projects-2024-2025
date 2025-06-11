const StringStorage = artifacts.require("StringStorage");

module.exports = async function (deployer) {
    const initialValue = "Hello, world!";
    await deployer.deploy(StringStorage, initialValue);
};
