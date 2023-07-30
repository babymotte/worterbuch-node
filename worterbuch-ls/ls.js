const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchLsNode(config) {
    const node = this;

    node.parent = config.parent;
    node.parentType = config.parentType || "string";

    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg) => {
        let parent;
        RED.util.evaluateNodeProperty(
          node.parent,
          node.parentType,
          node,
          msg,
          (err, value) => {
            if (err) {
              node.error("Unable to evaluate parent", msg);
              node.status({
                fill: "red",
                shape: "ring",
                text: "Unable to evaluate parent",
              });
              return;
            } else {
              parent = value;
            }
          }
        );

        parent ||= msg.topic;

        wb.ls(parent, ({ children }) => {
          msg.payload = children;
          node.send(msg);
        });
      });
    });
  }
  RED.nodes.registerType("worterbuch-ls", WorterbuchLsNode);
};
