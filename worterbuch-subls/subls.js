const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchSubLsNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      const topic = config.parent;
      wb.subscribeLs(topic, (payload) => {
        node.send({ payload, topic });
      });
    });
  }
  RED.nodes.registerType("worterbuch-subls", WorterbuchSubLsNode);
};
