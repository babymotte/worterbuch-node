const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPDelNode(config) {
    const node = this;

    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, null, status])
    );

    node.on("input", (msg, send, done) =>
      onInput(RED, config, node, msg, wb, send, done)
    );
  }
  RED.nodes.registerType("worterbuch-pdelete", WorterbuchPDelNode);
};

function onInput(RED, config, node, msg, wb, send, done) {
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
      send([msgs, null, null]);
      done();
    })
    .catch((err) => {
      const newMsg = { ...msg, pattern, payload: err.cause };
      send([null, [newMsg], null]);
      done();
    });
}
