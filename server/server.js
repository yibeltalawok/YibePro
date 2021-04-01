/* eslint no-console:0 */

const loopback = require("loopback");
const boot = require("loopback-boot");
// load env vars
const result = require("dotenv").config();

if (result.error) {
  throw result.error;
}

const app = loopback();
require("loopback-row-count-mixin")(app);
require("loopback-disable-method-mixin")(app);

app.start = function() {
  // start the web server
  return app.listen(() => {
    app.emit("started");
    console.log("Server started ");
    const baseUrl = app.get("url").replace(/\/$/, "");
    if (app.get("loopback-component-explorer")) {
      const explorerPath = app.get("loopback-component-explorer").mountPath;
      console.log("Browse your REST API at %s%s", baseUrl, explorerPath);
    }
  });
};
boot(app, __dirname, err => {
  if (err) throw err;
  if (require.main === module) app.start();
});

module.exports = app;
