const Influx = require('influx');

const timer = process.env.TIMER;
const Reporter = require('./reporter');
//const reporter = new Reporter();

let miners = process.env.MINERS.split(',') // ex var miners = "miner01:3333,miner02:3000,miner04:2222";

for (i = 0; i < miners.length; i++) {
	let miner = miners[i].split(':');
	this['reporter'+ i] = new Reporter(miner[0], miner[1]);
    this['reporter'+ i].run;
    }

//reporter.run();