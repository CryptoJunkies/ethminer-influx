const command = require('./tcp');
const Influx = require('influx');
const os = require('os');

const hostname = process.env.HOSTNAME || os.hostname();
const db = process.env.INFLUX_DB || 'miners_db';
const influxHost = process.env.INFLUX_HOST || 'localhost';
const influxPort = process.env.INFLUX_PORT || '8086';

const influx = new Influx.InfluxDB({
    host: influxHost,
    port: influxPort,
    database: db,
    username: process.env.INFLUX_USER,
    password: process.env.INFLUX_PASS,
    schema: [
        {
            measurement: 'node_stats',
            fields: {
                up_time: Influx.FieldType.INTEGER,
                hash_rate: Influx.FieldType.INTEGER,
                shares: Influx.FieldType.INTEGER,
                rejected_shares: Influx.FieldType.INTEGER,
                invalid_shares: Influx.FieldType.INTEGER,
                pool_switches: Influx.FieldType.INTEGER
            },
            tags: [
                'host'
            ]
        },
        {
            measurement: 'gpu_stats',
            fields: {
                id: Influx.FieldType.INTEGER,
                hash_rate: Influx.FieldType.INTEGER
            },
            tags: [
                'host', 'gpu'
            ]
        }
    ]
});

class Reporter {
    constructor(host, port, mtype) {
        this.timer = process.env.TIMER || 5000;
        this.port = port || 3000;
        this.host = host || '127.0.0.1';
        this.mtype = mtype || 'ethminer';
        console.log('Starting reporter for ' + this.host + ' (type ' + mtype + ') on port ' + this.port);
    }

    export(res) {
        let nodeStats = res;
        let gpuStats = res.gpu;
        delete nodeStats.gpu;
        influx.writePoints([
            {
                measurement: 'node_stats',
                tags: {host: hostname},
                fields: nodeStats,
            },
            ...gpuStats.map((g, i) => {
                return {
                    measurement: 'gpu_stats',
                    tags: {host: hostname, gpu: `${i}`},
                    fields: g
                }
            })
        ])
    }

    query() {
        return command('miner_getstat1', this.port, this.host)
            .then(res => {
                let queryResult = res.result;
                console.log(queryResult);
                return queryResult;
            })
    }

    format(raw) {
        /*
        https://github.com/ethereum-mining/ethminer/blob/master/libapicore/ApiServer.cpp
        https://github.com/nemosminer/DSTM-equihash-miner/blob/master/json-rpc.txt
        */
        var output = {};

        if (raw.id) { // dstm api, maybe ewbf also
            output.up_time = raw.uptime;
            output.hash_rate = raw.result[0].avg_sol_ps;
            output.shares = raw.result[0].accepted_shares;
            output.rejected_shares = raw.result[0].rejected_shares;
            output.gpu = raw.result[0].sol_ps;
            output.invalid_shares = 0;
            output.pool_switches = 0;
        } else { // must be claymore/ethminer api
            output.up_time = parseInt(raw[1]);
            output.hash_rate = parseInt(raw[2].split(';')[0]);
            output.shares = parseInt(raw[2].split(';')[1]);
            output.rejected_shares = parseInt(raw[2].split(';')[2]);
            output.gpu = raw[3].split(';').map((hashRate, id) => {
                return {
                    hash_rate: parseInt(hashRate)
                }
            });
            output.invalid_shares = parseInt(raw[8].split(';')[0]);
            output.pool_switches = parseInt(raw[8].split(';')[1]);
        }

        return output;
    }

    log(res) {
        if (!process.env.DEBUG) return res;
        console.log(res);
        return res
    }

    checkDatabase() {
        return influx.getDatabaseNames()
            .then(names => {
                if (!names.includes(db)) {
                    return influx.createDatabase(db);
                }
            })
            .catch(err => {
                console.error(`Error creating Influx database!`);
            })
    }

    run() {
        this.checkDatabase()
            .then(_ => {
                setInterval(_ => {
                    this.query()
                        .then(res => this.format(res))
                        .then(res => this.log(res))
                        .then(res => this.export(res))
                }, this.timer)
            });
    }
}

module.exports = Reporter;