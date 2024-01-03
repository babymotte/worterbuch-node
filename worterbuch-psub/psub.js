const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPSubNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config);

    wb.whenConnected(() => {
      wb.connection.pSubscribe(
        config.pattern,
        ({ keyValuePairs, deleted }) => {
          if (keyValuePairs) {
            const msgs = keyValuePairs.map(({ key, value }) => {
              return { payload: value, topic: key };
            });
            node.send([msgs, null, null]);
          }
          if (deleted) {
            const msgs = deleted.map(({ key, value }) => {
              return { payload: value, topic: key };
            });
            node.send([null, msgs, null]);
          }
        },
        config.unique,
        config.liveOnly,
        (payload) => node.send([null, null, [payload]])
      );
    });
  }
  RED.nodes.registerType("worterbuch-psub", WorterbuchPSubNode);
};
