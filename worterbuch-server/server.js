const { connect: wbClientConnect } = require("worterbuch-js");
const {
  WB_STATUS_ERROR,
  WB_STATE_DISCONNECTED,
  WB_STATE_WAITING_FOR_RECONNECT,
  WB_STATE_CONNECTING,
  WB_STATUS_WARNING,
  WB_STATUS_OK,
  WB_STATE_CONNECTED,
  WB_STATE_CONNECTION_FAILED,
} = require("../utils");

module.exports = function (RED) {
  function WorterbuchServerNode(config) {
    const node = this;

    RED.nodes.createNode(node, config);

    setupServer(node, config);
  }
  RED.nodes.registerType("worterbuch-server", WorterbuchServerNode);
};

function setupServer(node, config) {
  node.wb = {};
  node.wb.closed = false;
  node.wb.reconnect = config.reconnect;

  const onDisconnect = () => disconnected(node);
  node.on("close", () => onClose(node, onDisconnect));

  node.wb.connect = () => connect(node, config, onDisconnect);
  node.wb.connect();
}

function connect(node, config, onDisconnect) {
  if (node.wb.closed) {
    return;
  }

  updateStatus(
    node.wb.connectionStateCallbacks,
    WB_STATE_CONNECTING,
    WB_STATUS_ERROR
  );

  node.wb.connecting = true;

  node.wb.onConnectionStatus = (id, cb) => onConnectionStatus(node, id, cb);
  node.wb.clearOnConnectionStatus = (id) => clearOnConnectionStatus(node, id);
  node.wb.clearWhenConnected = (nodeId) => clearWhenConnected(node, nodeId);
  node.wb.whenConnected = (n, cb) => whenConnected(node, n, cb);

  connectWB(node, config, onDisconnect);
}

async function connectWB(node, config, onDisconnect) {
  try {
    if (node.wb.connection) {
      node.wb.connection.close();
    }
    const addresses = config.servers
      ? config.servers.split(",").map((s) => `${config.proto}://${s.trim()}/ws`)
      : [];

    node.wb.connection = await wbClientConnect(addresses, config.auth);
    if (node.wb.closed) {
      throw new Error("node closed while connecting");
    }
    connected(node, onDisconnect);
  } catch (err) {
    connectionFailed(node, err, onDisconnect);
  }
}

function connected(node, onDisconnect) {
  updateStatus(
    node.wb.connectionStateCallbacks,
    WB_STATE_CONNECTED,
    WB_STATUS_OK
  );
  node.wb.connection.onclose = onDisconnect;
  node.wb.connected = true;
  node.wb.connecting = false;
  node.wb.connection.setClientName("node-red");
  if (node.wb.connectedCallbacks) {
    try {
      node.wb.connectedCallbacks.forEach((cb) => {
        cb();
      });
    } catch (err) {
      console.error("Error in connected callback:", err);
    }
  }
}

function connectionFailed(node, err, onDisconnect) {
  updateStatus(
    node.wb.connectionStateCallbacks,
    WB_STATE_CONNECTION_FAILED,
    WB_STATUS_ERROR
  );
  console.error(err);
  node.wb.connected = false;
  node.wb.connecting = false;
  onDisconnect();
}

function whenConnected(node, n, cb) {
  if (node.wb.closed) {
    return;
  }

  if (!node.wb.connectedCallbacks) {
    node.wb.connectedCallbacks = new Map();
  }

  n.on("close", () => clearWhenConnected(n.id));
  node.wb.connectedCallbacks.set(n.id, cb);
  if (node.wb.connected) {
    cb();
  }
}

function clearWhenConnected(node, nodeId) {
  if (node.wb.connectedCallbacks) {
    node.wb.connectedCallbacks.delete(nodeId);
  }
}

function clearOnConnectionStatus(node, id) {
  if (node.wb.connectionStateCallbacks) {
    node.wb.connectionStateCallbacks.delete(id);
  }
}

function onConnectionStatus(node, id, cb) {
  if (!node.wb.connectionStateCallbacks) {
    node.wb.connectionStateCallbacks = new Map();
  }
  node.wb.connectionStateCallbacks.set(id, cb);
}

function onClose(node, close) {
  console.log("Server node closed.");

  node.wb.closed = true;
  node.wb.reconnect = false;
  node.wb.connected = false;
  node.wb.connecting = false;

  if (node.wb.connection) {
    node.wb.connection.close();
  } else {
    close();
  }

  if (node.wb.reconnectTimeout) {
    clearTimeout(node.wb.reconnectTimeout);
  }
}

function disconnected(node) {
  if (node.wb.connected) {
    console.log("Connection closed.");
  }
  node.wb.connected = false;
  node.wb.connecting = false;

  updateStatus(
    node.wb.connectionStateCallbacks,
    WB_STATE_DISCONNECTED,
    WB_STATUS_ERROR
  );

  if (node.wb.reconnect && !node.wb.closed) {
    if (node.wb.reconnectTimeout) {
      clearTimeout(node.wb.reconnectTimeout);
    }
    node.wb.reconnectTimeout = setTimeout(() => reconnect(node), 1000);
  }
}

function reconnect(node) {
  if (node.wb.closed) {
    return;
  }

  node.wb.connected = false;
  node.wb.connecting = true;
  console.log("Trying to reconnect …");

  updateStatus(
    node.wb.connectionStateCallbacks,
    WB_STATE_WAITING_FOR_RECONNECT,
    WB_STATUS_WARNING
  );

  if (node.wb.reconnectTimeout) {
    clearTimeout(node.wb.reconnectTimeout);
  }
  node.wb.reconnectTimeout = setTimeout(node.wb.connect, 2000);
}

function updateStatus(callbacks, state, status) {
  if (callbacks) {
    callbacks.forEach((cb) => {
      cb({ status, state });
    });
  }
}
