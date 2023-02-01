module.exports = function (RED) {
  function WorterbuchGetNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const server = RED.nodes.getNode(config.server);
    const wb = server.wb;
    wb.onhandshake = () => {
      node.on("input", (msg) => {
        wb.get(msg.payload, (val) => {
          msg.payload = val;
          node.send(msg);
        });
      });
    };
  }
  RED.nodes.registerType("worterbuch-get", WorterbuchGetNode);
};
