const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchLsNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg, send, done) => {
        let parent = RED.util.evaluateNodeProperty(
          config.parent,
          config.parentType,
          node,
          msg
        );

        console.log("parent", parent);

        wb.connection
          .ls(parent || undefined)
          .then((children) => {
            const newMsg = { ...msg, topic: parent, payload: children };
            send([[newMsg], null]);
            done();
          })
          .catch((err) => {
            const newMsg = { ...msg, topic: parent, payload: err };
            send([null, [newMsg]]);
            done();
          });
      });
    });
  }
  RED.nodes.registerType("worterbuch-ls", WorterbuchLsNode);
};
