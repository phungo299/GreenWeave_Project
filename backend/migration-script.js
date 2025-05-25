// Migration script để cập nhật Product schema với các trường mới
// Chạy script này sau khi cập nhật model

const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenweave', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function migrateProducts() {
  try {
    console.log('Bắt đầu migration sản phẩm...');
    
    // Lấy tất cả sản phẩm hiện có
    const products = await Product.find({});
    console.log(`Tìm thấy ${products.length} sản phẩm cần migration`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      const updateData = {};
      
      // Thêm các trường mới nếu chưa có
      if (!product.title) {
        updateData.title = product.name || '';
      }
      
      if (!product.slug) {
        // Tạo slug từ tên sản phẩm
        const slug = product.name
          ? product.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
              .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ chữ, số, space, dấu gạch
              .replace(/\s+/g, '-') // Thay space bằng dấu gạch
              .replace(/-+/g, '-') // Loại bỏ dấu gạch liên tiếp
              .trim('-')
          : `product-${product._id}`;
        
        // Đảm bảo slug unique
        let uniqueSlug = slug;
        let counter = 1;
        while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: product._id } })) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        updateData.slug = uniqueSlug;
      }
      
      if (!product.productCode) {
        // Tạo mã sản phẩm unique
        let productCode = `SP${String(updatedCount + 1).padStart(4, '0')}`;
        let counter = 1;
        while (await Product.findOne({ productCode, _id: { $ne: product._id } })) {
          productCode = `SP${String(updatedCount + counter).padStart(4, '0')}`;
          counter++;
        }
        updateData.productCode = productCode;
      }
      
      if (typeof product.stock === 'number') {
        // Chuyển stock từ number sang string
        updateData.stock = product.stock > 0 ? 'Còn hàng' : 'Hết hàng';
        updateData.quantity = product.stock;
      } else if (!product.stock) {
        updateData.stock = 'Còn hàng';
      }
      
      if (!product.quantity && typeof product.quantity !== 'number') {
        updateData.quantity = 0;
      }
      
      if (!product.category) {
        updateData.category = '';
      }
      
      if (!product.images || !Array.isArray(product.images)) {
        updateData.images = [];
      }
      
      if (!product.selectedColor) {
        updateData.selectedColor = '';
      }
      
      if (!product.selectedSize) {
        updateData.selectedSize = '';
      }
      
      if (!product.priceHistory || !Array.isArray(product.priceHistory)) {
        updateData.priceHistory = product.price ? [{ 
          price: product.price, 
          updatedAt: product.createdAt || new Date() 
        }] : [];
      }
      
      // Cập nhật variants nếu cần
      if (product.variants && Array.isArray(product.variants)) {
        const updatedVariants = product.variants.map(variant => ({
          variantId: variant.variantId || `${product._id}-${variant.color || 'default'}`,
          color: variant.color || '',
          imageUrl: variant.imageUrl || '',
          stock: variant.stock || 0
        }));
        updateData.variants = updatedVariants;
      }
      
      // Thực hiện cập nhật nếu có thay đổi
      if (Object.keys(updateData).length > 0) {
        await Product.findByIdAndUpdate(product._id, updateData);
        updatedCount++;
        console.log(`Đã cập nhật sản phẩm: ${product.name} (${product._id})`);
      }
    }
    
    console.log(`Migration hoàn thành! Đã cập nhật ${updatedCount} sản phẩm.`);
    
    // Tạo indexes mới
    console.log('Tạo indexes mới...');
    await Product.collection.createIndex({ slug: 1 }, { unique: true });
    await Product.collection.createIndex({ productCode: 1 }, { unique: true });
    await Product.collection.createIndex({ name: "text", description: "text", title: "text" });
    console.log('Đã tạo indexes thành công!');
    
  } catch (error) {
    console.error('Lỗi trong quá trình migration:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Chạy migration
migrateProducts(); 