const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Options de base pour Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gardien du Temps API',
            version: '1.0.0',
            description: 'API de gestion pour centres de loisirs et activités extrascolaires',
            contact: {
                name: 'Support Technique',
                email: 'support@gardien-temps.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Serveur de développement'
            },
            {
                url: 'https://api.gardien-temps.com/api/v1',
                description: 'Serveur de production'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [
        './src/routes/*.js',
        './src/models/*.js',
        './src/docs/*.yaml'
    ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
    serve: swaggerUi.serve,
    setup: swaggerUi.setup(swaggerDocs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Gardien du Temps - Documentation API"
    })
};

// Configuration documentation API Swagger/OpenAPI 3.0
// - Métadonnées API (titre, version, contact)
// - Serveurs dev/prod
// - Authentification JWT Bearer
// - Scanner automatique des routes pour docs
// ⚠️ Problème : APIs paths incorrects