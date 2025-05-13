const { AddressModel, UserModel } = require('../../models/connectModel');

class AddressController {

     // Lấy tất cả địa chỉ của tất cả người dùng
  static async getAllAddresses(req, res) {
    try {
      const addresses = await AddressModel.findAll({
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['name', 'email'],
          }
        ],
      });

      if (!addresses || addresses.length === 0) {
        return res.status(404).json({ message: 'Không có địa chỉ nào' });
      }

      const formatted = addresses.map(item => ({
        id: item.id,
        user_name: item.user?.name,
        user_email: item.user?.email,
        address_line1: item.address_line1,
        address_line2: item.address_line2,
        city: item.city,
        district: item.district,
        province: item.province,
        postal_code: item.postal_code,
        is_default: item.is_default,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      res.status(200).json({
        status: 200,
        message: 'Danh sách địa chỉ',
        data: formatted,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  // Thêm mới địa chỉ cho người dùng
  static async addAddress(req, res) {
    try {
      const { user_id, address_line1, address_line2, city, district, province, postal_code, is_default } = req.body;

      const newAddress = await AddressModel.create({
        user_id,
        address_line1,
        address_line2,
        city,
        district,
        province,
        postal_code,
        is_default,
      });

      res.status(201).json({
        status: 201,
        message: 'Thêm địa chỉ thành công',
        data: newAddress,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  // Lấy địa chỉ theo ID
static async getAddressById(req, res) {
    try {
      const { id } = req.params;  
      const address = await AddressModel.findByPk(id); 
  
      if (!address) {
        return res.status(404).json({ message: 'Địa chỉ không tồn tại' });
      }
  
      res.status(200).json({
        status: 200,
        message: 'Lấy địa chỉ thành công',
        data: address,  
      });
    } catch (err) {
      res.status(500).json({ error: err.message });  
    }
  }
  
  // Cập nhật địa chỉ của người dùng
  static async updateAddress(req, res) {
    try {
      const { id } = req.params;
      const { user_id, address_line1, address_line2, city, district, province, postal_code, is_default } = req.body;
      const address = await AddressModel.findByPk(id);
      if (!address) {
        return res.status(404).json({ message: 'Địa chỉ không tồn tại' });
      }
      address.user_id = user_id || address.user_id; 
      address.address_line1 = address_line1 || address.address_line1;
      address.address_line2 = address_line2 || address.address_line2;
      address.city = city || address.city;
      address.district = district || address.district;
      address.province = province || address.province;
      address.postal_code = postal_code || address.postal_code;
      address.is_default = is_default !== undefined ? is_default : address.is_default;
  
      await address.save(); 
  
      res.status(200).json({
        status: 200,
        message: 'Cập nhật địa chỉ thành công',
        data: address,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Xóa địa chỉ của người dùng
  static async deleteAddress(req, res) {
    try {
      const { id } = req.params;

      const address = await AddressModel.findByPk(id);
      if (!address) {
        return res.status(404).json({ message: 'Địa chỉ không tồn tại' });
      }

      await address.destroy();

      res.status(200).json({
        status: 200,
        message: 'Xóa địa chỉ thành công',
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = AddressController;
