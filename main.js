"use strict";

const utils = require("@iobroker/adapter-core");

class VisNewborn extends utils.Adapter {
  constructor(options) {
    super(Object.assign({}, options, { name: "vis-newborn" }));
    this.on("ready", this.onReady.bind(this));
  }

  onReady() {
    if (this.terminate) {
      this.terminate("Adapter only delivers files", 11);
    } else {
      process.exit(0);
    }
  }
}

if (require.main !== module) {
  module.exports = (options) => new VisNewborn(options);
} else {
  new VisNewborn();
}
