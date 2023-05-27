const swaggerJSDoc = require('swagger-jsdoc')

swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    failOnErrors: true,
    openapi: '3.1.0',
    swagger: `2.0`,
    info: {
      title: 'Web Transport Adviser',
      version: '0.0.1',
      description: 'This is the API documentation for the Web Transport Adviser',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Brian Twene',
        url: 'https://github.com/bt521',
      },
    },
    servers: [
      {
        url: 'http://localhost:3443',
      },
    ],
  },
  apis: ['../*/*API.js'],
}
module.exports = docSpec = swaggerJSDoc(options)
