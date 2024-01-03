const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPGetNode(config) {
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
          .pGet(pattern)
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
  RED.nodes.registerType("worterbuch-pget", WorterbuchPGetNode);
};
