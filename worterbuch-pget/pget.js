const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPGetNode(config) {
    const node = this;

    node.pattern = config.pattern || "payload";
    node.patternType = config.patternType || "msg";

    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg) => {
        let pattern;
        RED.util.evaluateNodeProperty(
          node.pattern,
          node.patternType,
          node,
          msg,
          (err, value) => {
            if (err) {
              node.error("Unable to evaluate pattern", msg);
              node.status({
                fill: "red",
                shape: "ring",
                text: "Unable to evaluate pattern",
              });
              return;
            } else {
              pattern = value;
            }
          }
        );

        wb.pGet(pattern, (kvps) => {
          const msgs = kvps.map(({ key, value }) => {
            const newMsg = { ...msg };
            newMsg.payload = value;
            newMsg[node.pattern] = key;
            return newMsg;
          });
          node.send([msgs]);
        });
      });
    });
  }
  RED.nodes.registerType("worterbuch-pget", WorterbuchPGetNode);
};
