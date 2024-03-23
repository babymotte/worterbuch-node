const { connect } = require("worterbuch-js");

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
      node.wb.connecting = true;
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
          node.wb.connection = await connect(
            `${config.proto}://${config.host}:${config.port}/ws`,
            config.auth
          );
          if (node.wb.closed) {
            throw new Error("node closed while connecting");
          }
          node.wb.connection.onclose = onclose;
          node.wb.connected = true;
          node.wb.connecting = false;
          if (node.wb.connectedCallbacks) {
            try {
              node.wb.connectedCallbacks.forEach((cb) => cb());
            } catch (err) {
              console.error("Error in connected callback:", err);
            }
            delete node.wb.connectedCallbacks;
          }
        } catch (err) {
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
