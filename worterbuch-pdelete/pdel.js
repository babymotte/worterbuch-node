const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPDelNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      node.on("input", (msg, send, done) => {
        let pattern =
          RED.util.evaluateNodeProperty(
            config.pattern,
            config.patternType,
            node,
            msg
          ) || msg.topic;

        wb.connection
          .pDelete(pattern)
          .then((kvps) => {
            const msgs = kvps.map(({ key, value }) => ({
              ...msg,
              topic: key,
              payload: value,
              pattern,
            }));
            send([msgs, null]);
            done();
          })
          .catch((err) => {
            const newMsg = { ...msg, pattern, payload: err };
            send([null, [newMsg]]);
            done();
          });
      });
    });
  }
  RED.nodes.registerType("worterbuch-pdelete", WorterbuchPDelNode);
};
