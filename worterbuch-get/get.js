const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchGetNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, null, status])
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

        wb.connection
          .get(key)
          .then((val) => {
            const newMsg = { ...msg, topic: key, payload: val };
            node.send([[newMsg], null, null]);
            node.done();
          })
          .catch((err) => {
            const newMsg = { ...msg, topic: key, payload: err.cause };
            node.send([null, [newMsg], null]);
            node.done();
          });
      });
    });
  }
  RED.nodes.registerType("worterbuch-get", WorterbuchGetNode);
};
