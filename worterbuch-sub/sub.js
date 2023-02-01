const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchSubNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      wb.subscribe(config.key, (val) => {
        node.send({ payload: val });
      });
    });
  }
  RED.nodes.registerType("worterbuch-sub", WorterbuchSubNode);
};
