const request = require('supertest');
const app = require('../../../app');

describe('Auth Routes', () => {
	test('should respond with 200 on GET /auth', async () => {
		const response = await request(app).get('/auth');
		expect(response.statusCode).toBe(200);
	});

	test('should respond with 201 on POST /auth/login', async () => {
		const response = await request(app).post('/auth/login').send({
			username: 'testuser',
			password: 'testpass'
		});
		expect(response.statusCode).toBe(201);
	});

	test('should respond with 401 on POST /auth/login with invalid credentials', async () => {
		const response = await request(app).post('/auth/login').send({
			username: 'wronguser',
			password: 'wrongpass'
		});
		expect(response.statusCode).toBe(401);
	});
});