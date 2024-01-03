const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchSubLsNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      const topic = config.parent || undefined;
      wb.connection.subscribeLs(
        topic,
        (children) => {
          node.send([[{ payload: children, topic }], null]);
        },
        (err) => {
          node.send([[{ payload: err, topic }], null]);
        }
      );
    });
  }
  RED.nodes.registerType("worterbuch-subls", WorterbuchSubLsNode);
};
