const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchSubNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      const topic = config.key;
      wb.subscribe(topic, (payload) => {
        node.send({ payload, topic });
      });
    });
  }
  RED.nodes.registerType("worterbuch-sub", WorterbuchSubNode);
};
