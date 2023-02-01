module.exports = function (RED) {
  function WorterbuchSubNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    const wb = server.wb;
    wb.whenConnected(() => {
      wb.subscribe(config.key, (val) => {
        node.send({ payload: val });
      });
    });
  }
  RED.nodes.registerType("worterbuch-sub", WorterbuchSubNode);
};
