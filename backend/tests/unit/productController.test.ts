import { Request, Response } from 'express';
import { Product } from '../../src/models';

// Import controller (sửa lại đường dẫn nếu cần)
// Giả sử bạn có controller tương tự như sau
const productController = {
  createProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.create(req.body);
      return res.status(201).json(product);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },
  
  getProducts: async (req: Request, res: Response) => {
    try {
      const products = await Product.find().populate('categoryId');
      return res.status(200).json(products);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },
  
  getProductById: async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }
      return res.status(200).json(product);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },
  
  updateProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }
      return res.status(200).json(product);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },
  
  deleteProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }
      return res.status(200).json({ message: 'Đã xóa sản phẩm thành công' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// Mock các models
jest.mock('../../src/models', () => ({
  Product: {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    populate: jest.fn()
  },
  Category: {
    findById: jest.fn()
  }
}));

describe('Product Controller Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = {
      params: {},
      body: {}
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const productData = {
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        categoryId: 'category123',
        stock: 10
      };
      
      mockRequest.body = productData;
      
      (Product.create as jest.Mock).mockResolvedValue({
        _id: 'product123',
        ...productData
      });
      
      await productController.createProduct(mockRequest as Request, mockResponse as Response);
      
      expect(Product.create).toHaveBeenCalledWith(productData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'product123',
        name: 'Test Product'
      }));
    });
    
    it('should handle errors during product creation', async () => {
      mockRequest.body = { name: 'Invalid Product' };
      
      const error = new Error('Validation failed');
      (Product.create as jest.Mock).mockRejectedValue(error);
      
      await productController.createProduct(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Validation failed' });
    });
  });
  
  describe('getProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { _id: 'product1', name: 'Product 1' },
        { _id: 'product2', name: 'Product 2' }
      ];
      
      (Product.find().populate as jest.Mock).mockResolvedValue(mockProducts);
      
      await productController.getProducts(mockRequest as Request, mockResponse as Response);
      
      expect(Product.find).toHaveBeenCalled();
      expect(Product.find().populate).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockProducts);
    });
  });
  
  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const mockProduct = { _id: 'product123', name: 'Test Product' };
      mockRequest.params = { id: 'product123' };
      
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      
      await productController.getProductById(mockRequest as Request, mockResponse as Response);
      
      expect(Product.findById).toHaveBeenCalledWith('product123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockProduct);
    });
    
    it('should return 404 if product not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      
      (Product.findById as jest.Mock).mockResolvedValue(null);
      
      await productController.getProductById(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Sản phẩm không tồn tại' });
    });
  });
  
  describe('updateProduct', () => {
    it('should update a product', async () => {
      const updateData = { name: 'Updated Product', price: 150 };
      mockRequest.params = { id: 'product123' };
      mockRequest.body = updateData;
      
      const updatedProduct = { _id: 'product123', ...updateData };
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedProduct);
      
      await productController.updateProduct(mockRequest as Request, mockResponse as Response);
      
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('product123', updateData, { new: true });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(updatedProduct);
    });
  });
  
  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      mockRequest.params = { id: 'product123' };
      
      (Product.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'product123' });
      
      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);
      
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith('product123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Đã xóa sản phẩm thành công' });
    });
    
    it('should return 404 if product to delete not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      
      (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      
      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Sản phẩm không tồn tại' });
    });
  });
}); 