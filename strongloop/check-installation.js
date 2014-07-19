var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var semver = require('semver');

var logo = fs.readFileSync(path.join(__dirname, 'logo.txt'), 'utf-8');
console.log(logo);

function run_slc(command, cb) {
  var args = [], runner = '';
  if (process.platform === 'win32') {
    args = ['/c', 'slc', command];
    runner = 'cmd';
  } else {
    runner = 'slc';
    args = [command];
  }
  var ps = spawn(runner, args, {stdio: 'inherit'});
  if (cb) {
    ps.on('close', function (code) {
      cb(code);
    });
  }
  return ps;
}

var requiredDeps = require(path.join(__dirname, 'package.json')).requiredPeerDependencies;
var updateRequired = false;
if (process.env.npm_config_global && requiredDeps) {
  console.log('Checking required modules...');
  for (var d in requiredDeps) {
    var version = null;
    var requiredVer = requiredDeps[d];
    try {
      version = require(path.join('..', d, 'package.json')).version;
    } catch (e) {
      console.error('* %s@%s - missing', d, requiredVer);
      updateRequired = true;
    }
    if (!version) {
      continue;
    }
    var ok = semver.satisfies(version, requiredVer);
    if (!ok) {
      console.error('* %s@%s - not satisfied by %s', d, requiredVer, version);
      updateRequired = true;
    } else {
      console.log('* %s@%s - resolved by %s', d, requiredVer, version);
    }
  }
} else {
  console.log('The following StrongLoop modules are installed:\n');

  run_slc('version', function (code) {
    console.log('\ngenerator-loopback version must be >= 1.0.0.');
    console.log('Please run \'slc update\' to make sure all dependencies are up to date.\n');
  });
  return;
}

if (updateRequired) {
  run_slc('update', function (code) {
    if (code !== 0) {
      console.log('\'slc update\' failed. Please run it manually.\n');
    }
  });
} else {
  console.log('\nThe following StrongLoop modules are installed:\n');

  run_slc('version', function (code) {
    if (code === 0) {
      console.log('\nStrongLoop installation is now finished.\n');
    }
  });
}


