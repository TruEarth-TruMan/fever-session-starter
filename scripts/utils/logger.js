
/**
 * Centralized logging utility for build process
 */

const getTimestamp = () => {
  return new Date().toISOString().split('T')[1].slice(0, -1);
};

function log(message, isError = false) {
  const timestamp = getTimestamp();
  const prefix = isError ? '❌ ERROR' : '🔹 INFO';
  console[isError ? 'error' : 'log'](`[${timestamp}] ${prefix}: ${message}`);
}

module.exports = { log };

