const WB_STATE_DISCONNECTED = "DISCONNECTED";
const WB_STATE_WAITING_FOR_RECONNECT = "WAITING_FOR_RECONNECT";
const WB_STATE_CONNECTING = "CONNECTING";
const WB_STATE_CONNECTED = "CONNECTED";
const WB_STATE_CONNECTION_FAILED = "CONNECTION_FAILED";

const WB_STATUS_ERROR = "ERROR";
const WB_STATUS_WARNING = "WARNING";
const WB_STATUS_OK = "OK";

function setupWb(node, RED, config, statusCallback) {
  RED.nodes.createNode(node, config);
  node.server = RED.nodes.getNode(config.server);
  const wb = node.server.wb;
  trackStatus(wb, node, statusCallback);
  return wb;
}

function trackStatus(wb, node, statusCallback) {
  wb.onConnectionStatus(node.id, ({ state, status }) => {
    node.status({
      fill: statusColor(status),
      shape: "dot",
      text: stateText(state),
    });
    if (statusCallback) {
      statusCallback([{ payload: { state, status } }]);
    }
  });
  node.on("close", () => {
    wb.clearOnConnectionStatus(node.id);
  });
}

function stateText(status) {
  switch (status) {
    case WB_STATE_CONNECTED:
      return "connected";
    case WB_STATE_CONNECTING:
      return "connecting";
    case WB_STATE_CONNECTION_FAILED:
      return "connection failed";
    case WB_STATE_DISCONNECTED:
      return "disconnected";
    case WB_STATE_WAITING_FOR_RECONNECT:
      return "waiting for reconnect";
  }
}

function statusColor(status) {
  switch (status) {
    case WB_STATUS_OK:
      return "green";
    case WB_STATUS_WARNING:
      return "yellow";
    case WB_STATUS_ERROR:
      return "red";
  }
}

module.exports = {
  setupWb,
  WB_STATE_CONNECTED,
  WB_STATE_CONNECTING,
  WB_STATE_CONNECTION_FAILED,
  WB_STATE_DISCONNECTED,
  WB_STATE_WAITING_FOR_RECONNECT,
  WB_STATUS_ERROR,
  WB_STATUS_OK,
  WB_STATUS_WARNING,
};
