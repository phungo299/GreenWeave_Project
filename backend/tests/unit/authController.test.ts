import { Request, Response } from 'express';
import * as authController from '../../src/controllers/authController';
import { User } from '../../src/models';
import { signToken } from '../../src/utils';

// Mock các dependencies
jest.mock('../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('../../src/utils', () => ({
  signToken: jest.fn(),
  randomText: jest.fn().mockReturnValue('randomstring')
}));

jest.mock('../../src/services/emails', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}));

describe('Auth Controller Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    beforeEach(() => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123'
      };
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      });
      (signToken as jest.Mock).mockResolvedValue('jwt_token');
    });

    it('should register a new user successfully', async () => {
      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Đăng ký thành công!',
        data: expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          token: 'jwt_token'
        })
      }));
    });

    it('should return error if user exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        username: 'testuser',
        email: 'test@example.com'
      });

      await authController.register(mockRequest as Request, mockResponse as Response);
      
      expect(User.create).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        username: expect.any(String)
      }));
    });
  });

  describe('checkUsername', () => {
    it('should return availability status of username', async () => {
      mockRequest.body = { username: 'existinguser' };
      
      // Test khi username đã tồn tại
      (User.findOne as jest.Mock).mockResolvedValueOnce({
        username: 'existinguser'
      });
      
      await authController.checkUsername(mockRequest as Request, mockResponse as Response);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ available: true });
      
      // Test khi username chưa tồn tại
      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      
      await authController.checkUsername(mockRequest as Request, mockResponse as Response);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ available: true });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockRequest.body = {
        login: 'existinguser',
        password: 'Test@123'
      };
    });

    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'existinguser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        isDisabled: false
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (require('bcryptjs').compare as jest.Mock).mockResolvedValue(true);
      (signToken as jest.Mock).mockResolvedValue('jwt_token');

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Đăng nhập thành công!',
        data: {
          id: undefined,
          username: 'existinguser',
          email: undefined,
          role: undefined,
          isVerified: true,
          token: 'jwt_token'
        }
      });
    });

    it('should reject login with wrong credentials', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'existinguser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'user',
        isDisabled: false
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (require('bcryptjs').compare as jest.Mock).mockResolvedValue(false);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Tài khoản không tồn tại!",
        login: "Vui lòng kiểm tra lại!"
      });
    });
  });
}); 