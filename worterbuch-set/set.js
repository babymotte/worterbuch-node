const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchSetNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg) => {
        wb.set(msg.topic, msg.payload);
      });
    });
  }
  RED.nodes.registerType("worterbuch-set", WorterbuchSetNode);
};
