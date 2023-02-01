const { connect } = require("worterbuch-js");

module.exports = function (RED) {
  function WorterbuchServerNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.reconnect = config.reconnect;
    this.on("close", () => {
      node.reconnect = false;
      node.wb.close();
    });
    node.connect = () => {
      node.wb = connect(`ws://${config.host}:${config.port}/ws`);
      node.wb.onclose = () => {
        console.log("Connection lost.");
        if (node.reconnect) {
          setTimeout(() => {
            console.log("Trying to reconnect …");
            setTimeout(node.connect, 2000);
          }, 1000);
        }
      };
    };
    node.connect();
  }
  RED.nodes.registerType("worterbuch-server", WorterbuchServerNode);
};
