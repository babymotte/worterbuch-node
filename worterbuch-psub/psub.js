const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPSubNode(config) {
    const node = this;

    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, null, null, status])
    );

    wb.whenConnected(node, () => whenConnected(node, wb, config));
  }
  RED.nodes.registerType("worterbuch-psub", WorterbuchPSubNode);
};

function whenConnected(node, wb, config) {
  if (node.connection === wb.connection) {
    return;
  } else {
    node.connection = wb.connection;
  }

  const topic = config.pattern;
  wb.connection.pSubscribe(
    topic,
    (e) => onPState(node, e.keyValuePairs, e.deleted),
    config.unique,
    config.liveOnly,
    (e) => onError(node, topic, e)
  );
}

function onPState(node, keyValuePairs, deleted) {
  if (keyValuePairs !== undefined) {
    const msgs = keyValuePairs.map(({ key, value }) => {
      return { payload: value, topic: key };
    });
    node.send([msgs, null, null, null]);
  }

  if (deleted !== undefined) {
    const msgs = deleted.map(({ key, value }) => {
      return { payload: value, topic: key };
    });
    node.send([null, msgs, null, null]);
  }
}

function onError(node, topic, payload) {
  node.send([null, null, [{ payload, topic }], null]);
}
