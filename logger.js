'use strict'
const path = require('path')
const util = require('util')
const colors = require('colors')

const gStartTimeMS = Date.now()

colors.setTheme({
  debug: 'blue',
  info: 'green',
  warn: 'yellow',
  error: 'red',
  fatal: 'red'
})

exports.facility = facility
function facility(filename, overrideLevel) {
  const facilityName = filename ? path.basename(filename).split('.')[0] : undefined

  function debug(...args) {
    emit(Date.now(), facilityName, 'debug', ...args)
  }

  function info(...args) {
    emit(Date.now(), facilityName, 'info', ...args)
  }

  function warn(...args) {
    emit(Date.now(), facilityName, 'warn', ...args)
  }

  function error(...args) {
    emit(Date.now(), facilityName, 'error', ...args)
  }

  function fatal(...args) {
    emit(Date.now(), facilityName, 'fatal', ...args)
  }

  function dir(obj, options) {
    debug(util.inspect(obj, options))
  }

  function noop() { }

  const level = overrideLevel || 'info'
  const isDebug = level === 'debug'
  const isInfo = isDebug || level === 'info'
  const isWarn = isInfo || level === 'warn'
  const isError = isWarn || level === 'error'
  const isFatal = isError || level === 'fatal'

  return {
    dir: isDebug ? dir : noop,
    log: isDebug ? debug : noop,

    debug: isDebug ? debug : noop,
    info: isInfo ? info : noop,
    warn: isWarn ? warn : noop,
    error: isError ? error : noop,
    fatal: isFatal ? fatal : noop
  }
}

Object.assign(exports, facility())

/**
 * Master logging function. All log messages should go through here.
 *
 * @param {Number} dateMS Timestamp the message was logged
 * @param {String} facilityName Facility which logged the messsage
 * @param {String} level Level of the log message
 * @param {Array} All other arguments are added to the message text
 *    {Object} Outputs as JSON
 *    {Error} Outputs the stack field
 *    {*} Outputs as-is
 * @return {undefined}
 */
function emit(dateMS, facilityName, level, ...args) {
  let msg = dateMS - gStartTimeMS

  msg += ' ' + (level + ':')[level]
  if (facilityName)
    msg += ' [' + facilityName + ']'

  for (let i = 0; i < args.length; ++i) {
    const type = typeof args[i]
    if (type === 'object') {
      if (util.isError(args[i]))
        msg += ' ' + args[i].stack
      else
        msg += ' ' + JSON.stringify(args[i])
    } else {
      msg += ' ' + args[i]
    }
  }

  console.log(msg) // eslint-disable-line no-console
}
