import axiosClient from '../../services/axiosClient';

const demoProductService = {
  // Lấy danh sách sản phẩm
  getAllProducts: async () => {
    const response = await axiosClient.get('/demos/products');
    return response.data; // Trả về List<DemoProductDto>
  },

  // Thêm mới
  createProduct: async (payload) => {
    const response = await axiosClient.post('/demos/products', payload);
    return response.data;
  },

  // Cập nhật
  updateProduct: async (id, payload) => {
    const response = await axiosClient.put(`/demos/products/${id}`, payload);
    return response.data;
  },

  // Xóa
  deleteProduct: async (id) => {
    const response = await axiosClient.delete(`/demos/products/${id}`);
    return response.data;
  }
};

export default demoProductService;