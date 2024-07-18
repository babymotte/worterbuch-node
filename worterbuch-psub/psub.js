const { setupWb } = require("../utils");

module.exports = function (RED) {
  function WorterbuchPSubNode(config) {
    const node = this;
    const wb = setupWb(node, RED, config, (status) =>
      node.send([null, null, null, status])
    );

    wb.whenConnected(() => {
      wb.connection.pSubscribe(
        config.pattern,
        ({ keyValuePairs, deleted }) => {
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
        },
        config.unique,
        config.liveOnly,
        (payload) => node.send([null, null, [payload], null])
      );
    });
  }
  RED.nodes.registerType("worterbuch-psub", WorterbuchPSubNode);
};
