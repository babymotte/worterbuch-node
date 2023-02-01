module.exports = { setupWb };

function setupWb(node, RED, config) {
  RED.nodes.createNode(node, config);
  node.server = RED.nodes.getNode(config.server);
  const wb = node.server.wb;
  trackStatus(node);
  return wb;
}

function trackStatus(node) {
  const timer = setInterval(() => {
    const connected = node.server.wb.connected;
    const connecting = node.server.wb.connecting;

    if (connected) {
      node.status({ fill: "green", shape: "dot", text: "connected" });
    } else if (connecting) {
      node.status({ fill: "yellow", shape: "ring", text: "connecting" });
    } else {
      node.status({ fill: "red", shape: "ring", text: "disconnected" });
    }
  }, 1000);
  node.on("close", () => {
    clearInterval(timer);
  });
}
