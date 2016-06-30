var prettyFormat = require('./');
var util = require('util');
var chalk = require('chalk');

var TIMES_TO_RUN = 100000;

function testCase(name, fn) {
  var result, error, time;

  try {
    result = fn();
  } catch (err) {
    error = err;
  }

  if (!error) {
    var start = process.hrtime();

    for (var i = 0; i < TIMES_TO_RUN; i++) {
      fn();
    }

    var diff = process.hrtime(start)[1];
    var average = diff / TIMES_TO_RUN;

    time = Math.round(average);
  }

  return {
    name: name,
    result: result,
    error: error,
    time: time
  };
}

function test(name, value) {
  var formatted = testCase('prettyFormat()  ', function() {
    return prettyFormat(value);
  });

  var inspected = testCase('util.inspect()  ', function() {
    return util.inspect(value);
  });

  var stringified = testCase('JSON.stringify()', function() {
    return JSON.stringify(value, null, '  ');
  });

  var results = [formatted, formatted2, inspected, stringified].sort(function(a, b) {
    return a.time - b.time;
  });

  var winner = results[0];
  var loser  = results[results.length - 1];

  results.forEach(function(item, index) {
    item.isWinner = index === 0;
    item.isLoser  = index === results.length - 1;
  });

  function log(current) {
    var message = current.name;

    if (current.time)   message += ' - ' + current.time + 'ns';
    if (current.result) message += ' - ' + JSON.stringify(current.result);
    if (current.error)  message += ' - Error: ' + current.error.message;

    message = ' ' + message + ' ';

    if (current.error) message = chalk.dim(message);

    var diff = (current.time - winner.time);

    if (diff > (winner.time * 0.85)) {
      message = chalk.bgRed.black(message);
    } else if (diff > (winner.time * 0.65)) {
      message = chalk.bgYellow.black(message);
    } else if (!current.error) {
      message = chalk.bgGreen.black(message);
    } else {
      message = chalk.dim(message);
    }

    console.log('  ' + message);
  }

  console.log(name + ': ');
  log(formatted);
  log(inspected);
  log(stringified);
}

function returnArguments() {
  return arguments;
}

test('empty arguments', returnArguments());
test('arguments', returnArguments(1, 2, 3));
test('an empty array', []);
test('an array with items', [1, 2, 3]);
test('a typed array', new Uint32Array(3));
test('an array buffer', new ArrayBuffer(3));
test('a nested array', [[1, 2, 3]]);
test('true', true);
test('false', false);
test('an error', new Error());
test('a typed error with a message', new TypeError('message'));
test('a function constructor', new Function());
test('an anonymous function', function() {});
test('a named function', function named() {});
test('Infinity', Infinity);
test('-Infinity', -Infinity);
test('an empty map', new Map());
var mapWithValues = new Map();
var mapWithNonStringKeys = new Map();
mapWithValues.set('prop1', 'value1');
mapWithValues.set('prop2', 'value2');
mapWithNonStringKeys.set({ prop: 'value' }, { prop: 'value' });
test('a map with values', mapWithValues);
test('a map with non-string keys', mapWithNonStringKeys);
test('NaN', NaN);
test('null', null);
test('a number', 123);
test('a date', new Date(10e11));
test('an empty object', {});
test('an object with properties', { prop1: 'value1', prop2: 'value2' });
var objectWithPropsAndSymbols = { prop: 'value1' };
objectWithPropsAndSymbols[Symbol('symbol1')] = 'value2';
objectWithPropsAndSymbols[Symbol('symbol2')] = 'value3';
test('an object with properties and symbols', objectWithPropsAndSymbols);
test('an object with sorted properties', { b: 1, a: 2 });
test('regular expressions from constructors', new RegExp('regexp'));
test('regular expressions from literals', /regexp/ig);
test('an empty set', new Set());
var setWithValues = new Set();
setWithValues.add('value1');
setWithValues.add('value2');
test('a set with values', setWithValues);
test('a string', 'string');
test('a symbol', Symbol('symbol'));
test('undefined', undefined);
test('a WeakMap', new WeakMap());
test('a WeakSet', new WeakSet());
test('deeply nested objects', { prop: { prop: { prop: 'value' } } });
var circularReferences = {};
circularReferences.prop = circularReferences;
test('circular references', circularReferences);
var parallelReferencesInner = {};
var parallelReferences = { prop1: parallelReferencesInner, prop2: parallelReferencesInner };
test('parallel references', parallelReferences);
test('able to customize indent', { prop: 'value' });
var bigObj = {};
for (var i = 0; i < 50; i++) bigObj[i] = i;
test('big object', bigObj);
