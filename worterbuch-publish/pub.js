const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPubNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg, send, done) => {
        let key =
          RED.util.evaluateNodeProperty(
            config.key,
            config.keyType,
            node,
            msg
          ) || msg.topic;

        let val =
          RED.util.evaluateNodeProperty(
            config.value,
            config.valueType,
            node,
            msg
          ) || msg.payload;

        wb.connection.publish(key, val);
        done();
      });
    });
  }
  RED.nodes.registerType("worterbuch-publish", WorterbuchPubNode);
};
