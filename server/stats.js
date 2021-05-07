const ben = require('ben-jsutils');
ben.logTS(true);

const request = require('request');
const rp = require('request-promise');
const redis = require('redis');
const publisher = redis.createClient(); // this creates a new client

publisher.on('connect', function() { console.log('Redis client connected'); });

publisher.on('error', function (err) { console.log('Something went wrong ' + err); });

PullAllStats().then(GetNewStats);
setInterval(function() {
    PullAllStats().then(GetNewStats).then((newLineString) => {
        console.log(newLineString);
        if (newLineString.length) {
            publisher.publish('statChannel', newLineString);
        }
    });
}, 10000);

function PullAllStats() {
    return rp('https://relay-stream.sports.yahoo.com/nfl/stats.txt')
    .then((raw) => raw.split('\n'))
    .then((lines) => lines.filter(StatType));
}

function GetNewStats(lines) {
    const newlines = lines.filter(UpdateStats);
    return newlines.join('\n');
}

function UpdateStats(line) {
    let terms = line.split('|');
    const key = terms[0] + '|' + terms[1];
    terms.shift();
    terms.shift();
    const statline = terms.join('|');
    const diff = (!statObj[key] || statObj[key] != statline);
    statObj[key] = statline;
    return diff;
}

statObj = {};

const yahooStatMap = {
    'r': 'rushing',
    'w': 'receiving',
    'q': 'passing',
    'z': 'defense',
    'n': 'punting',
    'x': 'returning',
    'k': 'kicking'
};
const validStatLetters = Object.keys(yahooStatMap);

const statOrder = {
    'r': ['attempts', 'yards', 'TD', 'long'],
    'w': ['receptions', 'yards', 'TD', 'long'],
    'q': ['attempts', 'completions', '', 'yards', 'TD', 'int'],
    'z': [],
    'n': [],
    'x': [],
    'k': [],
};

function StatType(line) {
    return (validStatLetters.indexOf(line[0]) > -1) ? line[0] : false;
}

function GetPlayer(line) {
    return line.split('|')[1];
}