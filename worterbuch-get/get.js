const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchGetNode(config) {
    const node = this;

    node.key = config.key || "payload";
    node.keyType = config.keyType || "msg";

    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg) => {
        let key;
        RED.util.evaluateNodeProperty(
          node.key,
          node.keyType,
          node,
          msg,
          (err, value) => {
            if (err) {
              node.error("Unable to evaluate key", msg);
              node.status({
                fill: "red",
                shape: "ring",
                text: "Unable to evaluate key",
              });
              return;
            } else {
              key = value;
            }
          }
        );

        wb.get(key, (val) => {
          msg.payload = val;
          node.send(msg);
        });
      });
    });
  }
  RED.nodes.registerType("worterbuch-get", WorterbuchGetNode);
};
