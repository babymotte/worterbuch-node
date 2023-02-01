const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPSubNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      wb.pSubscribe(config.pattern, (kvps) => {
        const msgs = kvps.map(({ key, value }) => {
          return { payload: value, topic: key };
        });
        node.send([msgs]);
      });
    });
  }
  RED.nodes.registerType("worterbuch-psub", WorterbuchPSubNode);
};
