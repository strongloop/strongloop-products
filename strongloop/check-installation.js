var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var logo = fs.readFileSync(path.join(__dirname, 'logo.txt'), 'utf-8');
console.log(logo);
console.log('The following StrongLoop modules are installed:\n');

var args = [], runner = '';
if (process.platform === 'win32') {
  args = ['/c', 'slc', 'version'];
  runner = 'cmd';
} else {
  runner = 'slc';
  args = ['version'];
}

var ps = spawn(runner, args, {stdio: 'inherit'});

ps.on('close', function (code) {
  console.log('\ngenerator-loopback version must be >= 1.0.0.');
  console.log('Please run \'slc update\' to make sure all dependencies are up to date.\n');
});


