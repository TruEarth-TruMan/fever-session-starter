
try {
  console.log('Starting Fever application...');
  console.log(`Architecture: ${process.arch}`);
  console.log(`Platform: ${process.platform}`);
  
  require('./main.ts');
} catch (error) {
  console.error('Error starting application:', error);
}
