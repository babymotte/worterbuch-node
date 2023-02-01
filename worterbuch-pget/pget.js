const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPGetNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg) => {
        wb.pGet(msg.payload, (kvps) => {
          const msgs = kvps.map(({ key, value }) => {
            return { payload: value, topic: key };
          });
          node.send([msgs]);
        });
      });
    });
  }
  RED.nodes.registerType("worterbuch-pget", WorterbuchPGetNode);
};
