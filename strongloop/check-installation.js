var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var semver = require('semver');
var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

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
      if (d === 'strong-cli') {
        // This is the 1st time when strong-cli peer dep is not installed
        // The installation script is executed before peer deps are installed.
        return;
      }
      console.error('* %s@%s - missing'.warn, d, requiredVer);
      updateRequired = true;
    }
    if (!version) {
      continue;
    }
    var ok = semver.satisfies(version, requiredVer);
    if (!ok) {
      console.error('* %s@%s - not satisfied by %s'.warn, d, requiredVer, version);
      updateRequired = true;
    } else {
      console.log('* %s@%s - resolved by %s'.info, d, requiredVer, version);
    }
  }
} else {
  console.log('The following StrongLoop modules are installed:\n');

  run_slc('version', function (code) {
    console.log('\nNOTE: generator-loopback version must be >= 1.0.0.'.red);
    console.log('Please run '.red +
      'slc update'.yellow.underline + ' to ensure StrongLoop products are functioning.\n'.red);
  });
  return;
}

if (updateRequired) {
  console.log('\nRunning ' + 'slc update'.yellow.underline + '...');
  run_slc('update', function (code) {
    if (code !== 0) {
      console.log('slc update'.yellow +
        (' has failed (code=' + code + ').').error +
        ' To make sure StrongLoop' +
        ' products are functioning correctly, please run the ' +
        'slc update'.yellow +
        ' after completion.\n');
    } else {
      console.log('StrongLoop installation is now finished.\n'.info);
    }
  });
} else {
  console.log('\nThe following StrongLoop modules are installed:\n');
  run_slc('version', function (code) {
    if (code === 0) {
      console.log('\nStrongLoop installation is now finished.\n'.info);
    }
  });
}


