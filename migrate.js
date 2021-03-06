'use strict';

var assert = require('assert');
var sys = require('sys');
var exec = require('child-process-promise').exec;


module.exports = function migrate(options) {
  var _this = this;

  // A pin option is required. We use this to build your 
  // end point route.
  assert(options.pin);

  // The base migration cmd can be overridden entirely
  options.cmd = options.cmd || null;

  // Location of the database.json file.
  options.config = options.config || process.env.PWD + 'db/database.json';

  // Directory where your migrations are located
  options.migrations = options.migrations || process.env.PWD + 'db/migrations';

  // The environment to run the migrations under (dev, test, prod).
  options.env = options.env || 'dev';

  let pin = {cmd: 'migrate'};
  options.pin.split(",").forEach(function(el){
    let kv = el.split(":");
    pin[kv[0].trim()] = kv[1].trim();
  });

  pin['atleastone$'] = [
    {act: 'up'},
    {act: 'down'},
    {act: 'reset'},
    // {act: 'create'},
    // {act: 'db'},
  ];

  // Example act('role:name,cmd:migrate,act:up')
  _this.add(pin, cmdMigrate);

  // ##############################

  // up|down|reset|create|db
  function cmdMigrate(args, done) {
    let cmd;
    if(!options.cmd){
      cmd = 'db-migrate ' +
        ' --migrations-dir ' + options.migrations + 
        ' --config ' + options.config +
        ' --env ' + options.env +
        ' ' + args.act;
    }else{
      cmd = options.cmd;
    }

    exec(cmd)
        .then(function (result) {
            var stdout = result.stdout;
            var stderr = result.stderr;
            console.log('stdout: ', stdout);
            console.log('stderr: ', stderr);

            return done(null, {ok: true});
        })
        .catch(function (err) {
            console.error('ERROR: ', err);
            return done(err);
        });

  }

};
