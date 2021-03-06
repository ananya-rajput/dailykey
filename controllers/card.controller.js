const Card = require("../models/card.model");
const User = require("../models/user.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const fetch = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.params.id });
    return res.json({
      success: true,
      message: "Cards fetched!",
      data: {
        cards
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

const save = async (req, res) => {
  try {
    const { payment_method, id } = req.body;
    const user = await User.findOne({ _id: id });
    const pm = await stripe.paymentMethods.retrieve(payment_method);
    const card_obj = {
      pm_id: pm.id,
      stripe_id: pm.customer,
      user: id,
      brand: pm.card.brand,
      country: pm.card.country,
      exp_month: pm.card.exp_month,
      exp_year: pm.card.exp_year,
      funding: pm.card.funding,
      last4: pm.card.last4
    };
    if (!user.cards.length) {
      card_obj.is_default = true;
    }
    const card = new Card(card_obj);
    await card.save();
    user.cards = [...user.cards, card._id];
    await user.save();
    return res.json({
      success: true,
      message: "Card saved!",
      data: {
        card
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
    const { cardId, userId } = req.body;
    const current = await Card.findOne({ user: userId, is_default: true });
    if (current) {
      current.is_default = false;
      await current.save();
    }
    const doc = await Card.findOneAndUpdate(
      { _id: cardId },
      {
        $set: {
          is_default: true
        }
      },
      { new: true }
    );
    return res.json({
      success: true,
      message: "Default card changed!",
      data: {
        card: doc
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
    const { cardId, userId } = req.body;
    const doc = await Card.findOneAndRemove({ _id: cardId });
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          cards: cardId
        }
      }
    );
    return res.json({
      success: true,
      message: "Card deleted!",
      data: {
        card: doc
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
  fetch,
  save,
  _default,
  remove
};
