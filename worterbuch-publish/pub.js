const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPubNode(config) {
    const node = this;

    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, status])
    );

    node.on("input", (msg, send, done) =>
      onInput(RED, config, node, msg, wb, done, send)
    );
  }
  RED.nodes.registerType("worterbuch-publish", WorterbuchPubNode);
};

function onInput(RED, config, node, msg, wb, done, send) {
  let key =
    RED.util.evaluateNodeProperty(config.key, config.keyType, node, msg) ||
    msg.topic;

  let val =
    RED.util.evaluateNodeProperty(config.value, config.valueType, node, msg) ||
    msg.payload;

  wb.connection
    .publish(key, val)
    .then(done)
    .catch((err) => {
      const newMsg = { ...msg, topic: key, payload: err.cause };
      send([[newMsg], null]);
      done();
    });
}
