const AddressModel = require('../../models/addressesModel');
const UserModel = require('../../models/usersModel');
const { Op } = require('sequelize');

class AddressController {
  // Lấy tất cả địa chỉ
  static async getAllAddress(req, res) {
    try {
      const { search } = req.query;
      let whereUser = {};
      if (search) {
        whereUser = {
          name: {
            [Op.like]: `%${search}%`
          }
        };
      }

      const addresses = await AddressModel.findAll({
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email'],
            where: search ? whereUser : undefined,
          }
        ]
      });

      return res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      console.error('Error in AddressController.getAllAddress:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách địa chỉ' });
    }
  }

  // Lấy chi tiết địa chỉ
  static async getAddressDetail(req, res) {
    const { id } = req.params;
    try {
      const address = await AddressModel.findOne({
        where: { id },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!address) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
      }

      return res.status(200).json({ success: true, data: address });
    } catch (error) {
      console.error('Error in AddressController.getAddressDetail:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết địa chỉ' });
    }
  }

  // Lấy danh sách địa chỉ theo user
  static async getAddressesByUser(req, res) {
    const userId = req.params.id;
    try {
      const addresses = await AddressModel.findAll({
        where: { user_id: userId },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      console.error('Error in AddressController.getAddressesByUser:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi lấy địa chỉ theo user' });
    }
  }

  // Thêm địa chỉ mới với user_id mặc định là 1
  static async addAddress(req, res) {
    const {
      address_line,
      city,
      district,
      province,
      is_default
    } = req.body;

    const user_id = 1; // GÁN CỨNG user_id để test giao diện

    try {
 
      if (is_default) {
        await AddressModel.update({ is_default: false }, { where: { user_id } });
      }

      const newAddress = await AddressModel.create({
        address_line,
        city,
        district,
        province,
        is_default: !!is_default,
        user_id
      });

      return res.status(201).json({ success: true, data: newAddress, message: 'Thêm địa chỉ thành công' });
    } catch (error) {
      console.error('Error in AddressController.addAddress:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi thêm địa chỉ' });
    }
  }

  // Cập nhật địa chỉ
  static async updateAddress(req, res) {
    const { id } = req.params;
    const {
      address_line,
      city,
      district,
      province,
      is_default
    } = req.body;

    try {
      const address = await AddressModel.findOne({ where: { id } });
      if (!address) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
      }

      if (is_default) {
        await AddressModel.update(
          { is_default: false },
          {
            where: {
              user_id: address.user_id,
              id: { [Op.ne]: id }
            }
          }
        );
      }

      await AddressModel.update(
        {
          address_line,
          city,
          district,
          province,
          is_default: !!is_default
        },
        { where: { id } }
      );

      return res.status(200).json({ success: true, message: 'Cập nhật địa chỉ thành công' });
    } catch (error) {
      console.error('Error in AddressController.updateAddress:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật địa chỉ' });
    }
  }

  // Xóa địa chỉ
  static async deleteAddress(req, res) {
    const { id } = req.params;

    try {
      const address = await AddressModel.findOne({ where: { id } });
      if (!address) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
      }

      await AddressModel.destroy({ where: { id } });
      return res.status(200).json({ success: true, message: 'Xóa địa chỉ thành công' });
    } catch (error) {
      console.error('Error in AddressController.deleteAddress:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi xóa địa chỉ' });
    }
  }
}

module.exports = AddressController;
