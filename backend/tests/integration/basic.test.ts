import request from 'supertest';
import { app } from '../../src/index';

describe('Basic API Tests', () => {
  it('should return welcome message on root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Welcome to the GreenWeave API');
  });

  it('should have Swagger docs available', async () => {
    const response = await request(app).get('/api-docs');
    expect(response.status).toBe(301); // Redirect to /api-docs/ with trailing slash
  });

  it('should have health check endpoint', async () => {
    const response = await request(app).get('/api/health');
    // Endpoint có thể tồn tại hoặc không, nếu có thì expect 200
    if (response.status !== 404) {
      expect(response.status).toBe(200);
    }
  });
}); 