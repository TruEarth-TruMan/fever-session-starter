
function checkModuleFormat(configContent) {
  const isCommonJS = configContent.includes('module.exports =');
  
  if (!isCommonJS) {
    console.log(`❌ WARNING: electron-builder.js may not be using CommonJS format!`);
  }
  
  return isCommonJS;
}

module.exports = { checkModuleFormat };
