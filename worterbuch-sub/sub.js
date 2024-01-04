const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchSubNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      const topic = config.key;
      wb.connection.subscribe(
        topic,
        ({ value, deleted }) => {
          if (value !== undefined) {
            node.send([[{ payload: value, topic }], null, null]);
          }
          if (deleted !== undefined) {
            node.send([null, [{ payload: deleted, topic }], null]);
          }
        },
        config.unique,
        config.liveOnly,
        (payload) => {
          node.send([null, null, [{ payload, topic }]]);
        }
      );
    });
  }
  RED.nodes.registerType("worterbuch-sub", WorterbuchSubNode);
};
