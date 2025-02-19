const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchSubNode(config) {
    const node = this;

    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, null, null, status])
    );

    wb.whenConnected(node, () => whenConnected(node, wb, config));
  }
  RED.nodes.registerType("worterbuch-sub", WorterbuchSubNode);
};

function whenConnected(node, wb, config) {
  if (node.wb === wb.connection) {
    return;
  } else {
    node.wb = wb.connection;
  }

  const topic = config.key;
  wb.connection.subscribe(
    topic,
    (s) => onState(node, topic, s.value, s.deleted),
    config.unique,
    config.liveOnly,
    (e) => onError(node, topic, e)
  );
}

function onState(node, topic, value, deleted) {
  if (value !== undefined) {
    node.send([[{ payload: value, topic }], null, null, null]);
  }
  if (deleted !== undefined) {
    node.send([null, [{ payload: deleted, topic }], null, null]);
  }
}

function onError(node, topic, payload) {
  node.send([null, null, [{ payload, topic }], null]);
}
