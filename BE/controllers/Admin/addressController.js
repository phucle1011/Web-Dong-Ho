const AddressModel = require('../../models/addressesModel');
const UserModel = require('../../models/usersModel');
const { Op } = require('sequelize');

class AddressController {
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
  static async getAddressesByUser(req, res) {
  const { userId } = req.params;
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

}

module.exports = AddressController;
