'use strict';

const AWSP = require('./core');

const self = AWSP.stopwatch = module.exports = {
  startTime: null,
  lastTime: null,
  laps: [],
  start: () => {
    self.startTime = process.hrtime();
    self.lastTime = process.hrtime();
  },
  lap: (note) => {
    let lap = {
      note: note,
      elapsed: process.hrtime(self.lastTime)
    };
    self.laps.push(lap);
    self.lastTime = process.hrtime();
    return lap.elapsed;
  },
  lapElapsed: () => {
    return process.hrtime(self.lastTime);
  },
  startElapse: () => {
    return process.hrtime(self.startTime);
  },
  stop: () => {
    return process.hrtime(self.startTime);
  },
  consoleStartElapse: () => {
    let startElapse = self.startElapse();
    console.info("Elapse time from start: %ds %dms", startElapse[0], startElapse[1]/1000000);
  }
}
