const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchGetNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg) => {
        wb.get(msg.payload, (val) => {
          msg.payload = val;
          node.send(msg);
        });
      });
    });
  }
  RED.nodes.registerType("worterbuch-get", WorterbuchGetNode);
};
