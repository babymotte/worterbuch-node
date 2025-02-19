const { connect } = require("worterbuch-js");
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
    RED.nodes.createNode(this, config);
    const node = this;
    node.wb = {};
    node.wb.closed = false;
    node.wb.reconnect = config.reconnect;
    console.log("worterbuch server config:", config);
    const onclose = () => {
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
        node.wb.reconnectTimeout = setTimeout(() => {
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
        }, 1000);
      }
    };
    node.on("close", () => {
      console.log("Server node closed.");
      node.wb.closed = true;
      node.wb.reconnect = false;
      node.wb.connected = false;
      node.wb.connecting = false;
      if (node.wb.connection) {
        node.wb.connection.close();
      } else {
        onclose();
      }
      if (node.wb.reconnectTimeout) {
        clearTimeout(node.wb.reconnectTimeout);
      }
    });
    node.wb.connect = () => {
      if (node.wb.closed) {
        return;
      }

      updateStatus(
        node.wb.connectionStateCallbacks,
        WB_STATE_CONNECTING,
        WB_STATUS_ERROR
      );
      node.wb.connecting = true;
      node.wb.onConnectionStatus = (id, cb) => {
        if (!node.wb.connectionStateCallbacks) {
          console.log("Creating new connection state callback map.");
          node.wb.connectionStateCallbacks = new Map();
        }
        node.wb.connectionStateCallbacks.set(id, cb);
        console.log(
          "Connection state callback map size:",
          node.wb.connectionStateCallbacks.size
        );
      };
      node.wb.clearOnConnectionStatus = (id) => {
        if (node.wb.connectionStateCallbacks) {
          node.wb.connectionStateCallbacks.delete(id);
        }
      };
      node.wb.whenConnected = (cb) => {
        if (node.wb.closed) {
          return;
        }
        if (node.wb.connected) {
          cb();
        } else {
          if (!node.wb.connectedCallbacks) {
            node.wb.connectedCallbacks = [];
          }
          node.wb.connectedCallbacks.push(cb);
        }
      };

      (async () => {
        try {
          if (node.wb.connection) {
            node.wb.connection.close();
          }
          console.log("config.servers", config.servers);
          console.log("config", config);
          const addresses = config.servers
            ? config.servers
                .split(",")
                .map((s) => `${config.proto}://${s.trim()}/ws`)
            : [];

          console.log("addresses", addresses);
          node.wb.connection = await connect(addresses, config.auth);
          if (node.wb.closed) {
            throw new Error("node closed while connecting");
          }
          updateStatus(
            node.wb.connectionStateCallbacks,
            WB_STATE_CONNECTED,
            WB_STATUS_OK
          );
          node.wb.connection.onclose = onclose;
          node.wb.connected = true;
          node.wb.connecting = false;
          node.wb.connection.setClientName("node-red");
          if (node.wb.connectedCallbacks) {
            try {
              node.wb.connectedCallbacks.forEach((cb) => cb());
            } catch (err) {
              console.error("Error in connected callback:", err);
            }
            delete node.wb.connectedCallbacks;
          }
        } catch (err) {
          updateStatus(
            node.wb.connectionStateCallbacks,
            WB_STATE_CONNECTION_FAILED,
            WB_STATUS_ERROR
          );
          console.error(err);
          node.wb.connected = false;
          node.wb.connecting = false;
          onclose();
        }
      })();
    };
    node.wb.connect();
  }
  RED.nodes.registerType("worterbuch-server", WorterbuchServerNode);
};

function updateStatus(callbacks, state, status) {
  if (callbacks) {
    callbacks.forEach((cb) => {
      cb({ status, state });
    });
  }
}
