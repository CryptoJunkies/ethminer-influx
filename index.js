const Influx = require('influx');

const timer = process.env.TIMER;
const Reporter = require('./reporter');
const reporter = new Reporter();

// get command line args (miners to monitor should be passed in as hostname:port)
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
    });

reporter.run();
