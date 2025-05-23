const authController = require('../../../controllers/authController');

describe('authController', () => {
	test('should register a user successfully', async () => {
		const req = { body: { username: 'testuser', password: 'password' } };
		const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		await authController.register(req, res);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
	});

	test('should return error for missing username', async () => {
		const req = { body: { password: 'password' } };
		const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		await authController.register(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: 'Username is required' });
	});
});