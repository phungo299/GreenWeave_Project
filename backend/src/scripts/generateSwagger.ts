import swaggerAutogen from 'swagger-autogen';
import path from 'path';

const doc = {
  info: {
    title: 'GreenWeave API',
    description: 'Tài liệu API được sinh tự động từ định nghĩa routes',
    version: '1.0.0',
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:5000',
      description: 'Default server',
    },
  ],
};

// File đầu ra swagger YAML
const outputFile = path.resolve(__dirname, '../swagger.yaml');

// Danh sách file chứa routes để swagger-autogen quét
const endpointsFiles = [
  path.resolve(__dirname, '../index.ts'),
  path.resolve(__dirname, '../routes'),
];

(async () => {
  try {
    // Sử dụng định dạng OpenAPI 3
    await (swaggerAutogen({ openapi: '3.0.0' }) as any)(outputFile, endpointsFiles, doc);
    console.log(`✅ Swagger cập nhật thành công tại ${outputFile}`);
  } catch (err) {
    console.error('❌ Lỗi sinh swagger:', err);
    process.exit(1);
  }
})(); 