'use strict';

const isInstanceOf = require('core-functions/objects').isInstanceOf;

const rccCore = require('rcc-core');

const IoRedisClient = require('ioredis');
const ReplyError = IoRedisClient.ReplyError;
exports.ReplyError = ReplyError;

const adaptee = 'ioredis';
exports.adaptee = adaptee;

const defaultHost = 'localhost';
const defaultPort = rccCore.DEFAULT_REDIS_PORT;

exports.defaultHost = defaultHost;
exports.defaultPort = defaultPort;

exports.createClient = createClient;

exports.getClientFunction = getClientFunction;
exports.setClientFunction = setClientFunction;
exports.deleteClientFunction = deleteClientFunction;

exports.isMovedError = isMovedError;
exports.resolveHostAndPortFromMovedError = resolveHostAndPortFromMovedError;

function fixRedisClientFunctions() {
  const prototype = IoRedisClient.prototype;

  // If client is missing an `end` method then use its `quit` method as an `end` method
  if (!prototype.end) {
    console.warn('Missing end function for `ioredis` client prototype');
    // console.log('Adding missing end function to `ioredis` client prototype');
    // prototype.end = endViaQuit;
  }
}

function adaptRedisClient() {
  const prototype = IoRedisClient.prototype;

  if (!prototype.getAdapter) {
    prototype.getAdapter = getAdapter;
  }

  if (!prototype.getOptions) {
    prototype.getOptions = getOptions;
  }

  if (!prototype.isClosing) {
    prototype.isClosing = isClosing;
  }

  if (!prototype.resolveHostAndPort) {
    prototype.resolveHostAndPort = resolveHostAndPort;
  }

  if (!prototype.addEventListeners) {
    prototype.addEventListeners = addEventListeners;
  }

  if (!prototype.getFunction) {
    prototype.getFunction = getClientFunction;
  }

  if (!prototype.setFunction) {
    prototype.setFunction = setClientFunction;
  }

  if (!prototype.deleteFunction) {
    prototype.deleteFunction = deleteClientFunction;
  }
}

fixRedisClientFunctions();
adaptRedisClient();

/**
 * Creates a new RedisClient instance.
 * @param {RedisClientOptions|undefined} [redisClientOptions] - the options to use to construct the new Redis client
 *        instance
 * @return {RedisClient} returns the new RedisClient instance
 */
function createClient(redisClientOptions) {
  return new IoRedisClient(redisClientOptions);
}

function getClientFunction(fnName) {
  return IoRedisClient.prototype[fnName];
}

function setClientFunction(fnName, fn) {
  IoRedisClient.prototype[fnName] = fn;
}

function deleteClientFunction(fnName) {
  delete IoRedisClient.prototype[fnName];
}

/**
 * Returns true if the given error indicates that the key attempted was moved to a new host and port; otherwise returns
 * false.
 * @param {Error|ReplyError} error - an error thrown by a RedisClient instance
 * @return {boolean} true if moved; false otherwise
 */
function isMovedError(error) {
  // Check if error message contains something like: "MOVED 14190 127.0.0.1:6379"
  return !!isInstanceOf(error, ReplyError) && error.message && error.message.startsWith('MOVED ');
}

/**
 * Extracts the new host and port from the given RedisClient "moved" ReplyError.
 * @param {ReplyError|Error} movedError - a ReplyError thrown by a RedisClient instance that indicates the redis server
 *        has moved
 * @return {[string, number|string]} the new host and port
 */
function resolveHostAndPortFromMovedError(movedError) {
  // Attempt to resolve the new host & port from the error message
  if (isMovedError(movedError)) {
    return movedError.message.substring(movedError.message.lastIndexOf(' ') + 1).split(':');
  }
  throw new Error(`Unexpected ioredis client "moved" ReplyError - ${movedError}`);
}

// function endViaQuit(flush) {
//   let args = arguments;
//
//   // Drop the first flush argument (if any), since quit cannot use it
//   if (typeof flush !== 'function') {
//     const n = arguments.length;
//     args = new Array(n - 1);
//     for (let i = 1; i < n; ++i) {
//       args[i - 1] = arguments[i];
//     }
//   }
//   this.manuallyClosing = true; // simulate a "closing" flag
//   return this.quit.apply(this, args);
// }

/**
 * Returns true if this RedisClient instance's connection is closing or has closed.
 * @return {boolean} true if closing or closed; false otherwise
 */
function getAdapter() {
  return module.exports;
}

/**
 * Returns the options with which this RedisClient instance was constructed.
 * @returns {RedisClientOptions} the options used
 */
function getOptions() {
  return this.options;
}

/**
 * Returns true if this RedisClient instance's connection is closing or has closed.
 * @return {boolean} true if closing or closed; false otherwise
 */
function isClosing() {
  return this.manuallyClosing;
}

/**
 * Resolves the host & port of this RedisClient instance.
 * @return {[string, number|string]} an array containing the host and port
 */
function resolveHostAndPort() {
  const connectionOptions = this.connection_options;
  return connectionOptions ? [connectionOptions.host, connectionOptions.port] :
    this.options ? [this.options.host, this.options.port] : [defaultHost, defaultPort];
}

function addEventListeners(onConnect, onReady, onReconnecting, onError, onClientError, onEnd, onClose) {
  if (typeof onConnect === 'function') this.on('connect', onConnect);
  if (typeof onReady === 'function') this.on('ready', onReady);
  if (typeof onReconnecting === 'function') this.on('reconnecting', onReconnecting);
  if (typeof onError === 'function') this.on('error', onError);
  if (typeof onClientError === 'function') this.on('clientError', onClientError);
  if (typeof onEnd === 'function') this.on('end', onEnd);
  if (typeof onClose === 'function') this.on('close', onClose);
}