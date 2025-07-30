module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // CORRECTION : Transformer les modules ES6 de date-fns
  transformIgnorePatterns: [
    'node_modules/(?!(date-fns)/)'
  ],
  
  // Mapper les modules CSS
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // Extensions de fichiers supportées
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Pattern des fichiers de test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
  ]
};