
/**
 * Logger utility for the Fever build system
 */

/**
 * Logs a message to the console
 * @param {string} message - The message to log
 * @param {boolean} isError - Whether the message is an error
 */
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const prefix = isError ? '[ERROR]' : '[INFO]';
  
  if (isError) {
    console.error(`${prefix} ${timestamp}: ${message}`);
  } else {
    console.log(`${prefix} ${timestamp}: ${message}`);
  }
}

module.exports = { log };
