const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchLsNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, null, status])
    );

    wb.whenConnected(() => {
      node.on("input", (msg) => {
        let parent = RED.util.evaluateNodeProperty(
          config.parent,
          config.parentType,
          node,
          msg
        );

        wb.connection
          .ls(parent || undefined)
          .then((children) => {
            const newMsg = { ...msg, topic: parent, payload: children };
            node.send([[newMsg], null, null]);
            node.done();
          })
          .catch((err) => {
            const newMsg = { ...msg, topic: parent, payload: err.cause };
            node.send([null, [newMsg], null]);
            node.done();
          });
      });
    });
  }
  RED.nodes.registerType("worterbuch-ls", WorterbuchLsNode);
};
