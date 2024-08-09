// const {v4: uuidv4} = require("uuid")
// const Cart = require("../models/cart")
// const fetch = require("node-fetch");
// const Order = require("../models/order")

// const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY

// exports.initiatePayment = async (req, res) => {
//     const { user } = req;
//     const { amount, currency, firstName, lastName, phone, address } = req.body;
  
//     try {
//       const cart = await Cart.findOne({ user: user.id }).populate(
//         "menuItems.menuItem"
//       );
//       if (!cart || cart.menuItems.length === 0) {
//         res.json("Your cart is empty");   
//       }
  
//       const orderId = uuidv4();
  
//       const paymentData = {
//         tx_ref: orderId,
//         amount,
//         currency,
//         redirect_url: "http://localhost:5173/thankyou",
//         customer: {
//           email: user.email,
//           name: `${user.firstName} ${user.lastName}`,
//         },
//         meta: {
//           firstName: firstName,
//           lastName: lastName,
//           phone: phone,
//           address: address,
//         },
//         customizations: {
//           title: "Habby Purchase",
//           description: "Payment for items in cart",
//         },
//       };
  
//       const response = await fetch("https://api.flutterwave.com/v3/payments", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${FLW_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(paymentData),
//       });
  
//       const data = await response.json();
//       if (data.status === "success") { 
//         res.json({ link: data.data.link, orderId });
//       } else {
//         res.json("Payment Initiation Failed");
//       }
//     } catch (error) {
//       res.json("server error");
//       console.log(error);
//     }
//   };




const { v4: uuidv4 } = require("uuid");
const fetch = require("node-fetch");
const Cart = require("../models/cart");
const Order = require("../models/order");

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

if (!FLW_SECRET_KEY) {
  throw new Error("FLW_SECRET_KEY is not defined in environment variables");
}

exports.initiatePayment = async (req, res) => {
  const { user } = req;
  const { amount, currency, firstName, lastName, phone, address } = req.body;

  console.log("Request received:", req.body);

  if (!amount || !currency || !firstName || !lastName || !phone || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const cart = await Cart.findOne({ user: user.id }).populate("menuItems.menuItem");
    if (!cart || cart.menuItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const orderId = uuidv4();

    const paymentData = {
      tx_ref: orderId,
      amount,
      currency,
      redirect_url: "https://habby-frontend.vercel.app/thankyou",
      customer: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
      meta: {
        firstName,
        lastName,
        phone,
        address,
      },
      customizations: {
        title: "Habby Purchase",
        description: "Payment for items in cart",
      },
    };

    console.log("Payment Data:", paymentData);

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      console.log("Payment initiation success:", data);
      return res.status(200).json({ link: data.data.link, orderId });
    } else {
      console.error("Payment initiation failed:", data);
      return res.status(500).json({ message: "Payment Initiation Failed", details: data });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.verifyPayment = async (req, res) => {
  const { transaction_id, orderId } = req.body;
  const user = req.user.id; 

  try {
      const response = await fetch(
          `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
          {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${FLW_SECRET_KEY}`,
              },
          }
      );

      const data = await response.json();
      if (response.ok && data.status === "success") {
          const cart = await Cart.findOne({ user: req.user.id }).populate("menuItems.menuItem");

          if (!cart) {
              return res.status(400).json({ msg: "Cart not found" });
          }

          const order = new Order({
              user: user,
              orderId,
              firstName: data.data.meta.firstName,
              lastName: data.data.meta.lastName,
              phone: data.data.meta.phone,
              address: data.data.meta.address,
              menuItems: cart.menuItems, 
              amount: data.data.amount,
              status: "completed",
              transactionId: transaction_id,
          });

          await order.save();
          await Cart.findOneAndDelete({ user: req.user.id });

          return res.status(200).json({ msg: "Payment Successful", order });
      } else {
          console.error("Payment verification failed:", data);
          return res.status(400).json({ msg: "Payment verification failed", details: data });
      }
  } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ msg: "Server error", error: error.message });
  }
};


// exports.verifyPayment = async (req, res) => {
//     const {transaction_id, orderId} = req.body;
//     const user = req.user.id; 

//     try {
//         const response = await fetch(
//             `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
//             {
//                 method: "GET",
//                 headers: {
//                     Authorization: `Bearer ${FLW_SECRET_KEY}`,
//                 },
//             }
//         );

//         const data = await response.json();
//         if (data.status === "success") {
//             const cart = await Cart.findOne({user: req.user.id}).populate(
//                 "menuItems.menuItem"
//             )

//             const order = new Order({
//                 user: user,
//                 orderId,
//                 firstName: data.data.meta.firstName,
//                 lastName: data.data.meta.lastName,
//                 phone: data.data.meta.phone,
//                 address: data.data.meta.address,
//                 menuItems: cart.menuItems,
//                 amount: data.data.amount,
//                 status: "completed",
//                 transactionId: transaction_id,
//             });

//             await order.save();
//             await Cart.findOneAndDelete({ user: req.user.id });

//             res.json({ msg: "Payment Successful", order });
//         } else {
//             res.json({ msg: "Payment verification failed" })
//         }
//     } catch (error) {
//         console.error(error.message);
//     }
// }

exports.getOrderHistory = async (req, res) => {
  try {
      const orders = await Order.find({ user: req.user.id }).populate("menuItems.menuItem");
      res.json(orders);
  } catch (error) {
      res.status(500).json({ msg: "Server error" });
  }
};
