const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPubNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, status])
    );
    wb.whenConnected(() => {
      node.on("input", (msg) => {
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

        wb.connection
          .publish(key, val)
          .then(node.done)
          .catch((err) => {
            const newMsg = { ...msg, topic: key, payload: err.cause };
            node.send([[newMsg], null]);
            node.done();
          });
      });
    });
  }
  RED.nodes.registerType("worterbuch-publish", WorterbuchPubNode);
};
