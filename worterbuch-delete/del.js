const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchDelNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, null, status])
    );

    wb.whenConnected(() => {
      node.on("input", (msg, send, done) => {
        let key =
          RED.util.evaluateNodeProperty(
            config.key,
            config.keyType,
            node,
            msg
          ) || msg.topic;

        wb.connection
          .delete(key)
          .then((val) => {
            const newMsg = { ...msg, topic: key, payload: val };
            send([[newMsg], null, null]);
            done();
          })
          .catch((err) => {
            const newMsg = { ...msg, topic: key, payload: err.cause };
            send([null, [newMsg], null]);
            done();
          });
      });
    });
  }
  RED.nodes.registerType("worterbuch-delete", WorterbuchDelNode);
};
