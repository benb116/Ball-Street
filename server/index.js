/* eslint-disable no-console */
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });

  // If we run with the dev command, launch workers as well
  if (process.argv[2] === 'dev') {
  // eslint-disable-next-line global-require
    require('./rundev');
  }
} else {
  start();
}

function start() {
  // eslint-disable-next-line global-require
  require('./app');
}
