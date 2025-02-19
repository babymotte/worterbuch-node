const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchSubLsNode(config) {
    const node = this;

    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, null, status])
    );

    wb.whenConnected(node, () => whenConnected(node, wb, config));
  }
  RED.nodes.registerType("worterbuch-subls", WorterbuchSubLsNode);
};

function whenConnected(node, wb, config) {
  if (node.wb === wb.connection) {
    return;
  } else {
    node.wb = wb.connection;
  }

  const topic = config.parent || undefined;
  wb.connection.subscribeLs(
    topic,
    (children) => onChildren(node, topic, children),
    (e) => {
      onError(node, topic, e);
    }
  );
}

function onChildren(node, topic, payload) {
  node.send([[{ payload, topic }], null, null]);
}

function onError(node, topic, payload) {
  node.send([[{ payload, topic }], null, null]);
}
