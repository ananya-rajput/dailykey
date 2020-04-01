const Address = require("../models/address.model");
const User = require("../models/user.model");

const save = async () => {
  try {
    const { address, id } = req.body;
    const addr = new Address(address);
    const user = await User.findOne({ _id: id });
    if (!user.addresses.length) {
      addr.is_default = true;
    }
    addr.user = user.id;
    await addr.save();
    user.addresses = [...user.addresses, addr._id];
    await user.save();
    return res.json({
      success: true,
      message: "Address saved",
      data: { address: addr }
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message,
      data: null
    });
  }
};

const update = async (req, res) => {
  try {
    const { address } = req.body;
    const addr = await Address.findOneAndUpdate(
      { _id: addr._id },
      {
        $set: {
          line1: address.line1,
          line2: address.line2,
          zip: address.zip,
          city: address.city,
          state: address.state,
          instructions: address.instructions
        }
      },
      {
        new: true
      }
    );
    return res.json({
      success: true,
      message: "Address updated!",
      data: {
        address: addr
      }
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message,
      data: null
    });
  }
};

const _default = async (req, res) => {
  try {
    const { address, id } = req.body;
    const current = Address.findOne({ user: id, is_default: true });
    if (current) {
      current.is_default = false;
      await current.save();
    }
    const addr = await Address.findOneAndUpdate(
      { _id: address._id },
      {
        $set: {
          is_default: true
        }
      },
      { new: true }
    );
    return res.json({
      success: true,
      message: "Default address changed!",
      data: {
        address: addr
      }
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message,
      data: null
    });
  }
};

const remove = async (req, res) => {
  try {
    const { address, id } = req.body;
    await User.findOneAndUpdate(
      { _id: id },
      {
        $pull: {
          addresses: address._id
        }
      }
    );
    const addr = await Address.findOneAndRemove({ _id: address._id });
    return res.json({
      success: true,
      message: "Address deleted!",
      data: {
        address: addr
      }
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message,
      data: null
    });
  }
};

module.exports = {
  save,
  update,
  _default,
  remove
};