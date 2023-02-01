module.exports = function (RED) {
  function WorterbuchSetNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    const wb = server.wb;
    node.on("input", (msg) => {
      wb.set(msg.topic, msg.payload);
    });
  }
  RED.nodes.registerType("worterbuch-set", WorterbuchSetNode);
};
