const Cart = require("../models/cart")
const MenuItem = require("../models/menuItem")

//calculate amount

// const calculateAmount = async (menuItemId, quantity)=>{
//     const menuItem = await MenuItem.findById(menuItemId)
//     if (!menuItem) {
//         throw new Error("Item not found")
//     }

//     return menuItem.price * quantity
// }

exports.addToCart = async (req, res) => {
    const {menuItemId, quantity} = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user.id});
        if (!cart) {
            cart = new Cart({ user: req.user.id, menuItems: []})
        }


        const menuItem = await MenuItem.findById(menuItemId)
        if (!menuItem) {
            return res.json("product not found")
        }

        const menuItemIndex = cart.menuItems.findIndex((item) => item.menuItem.toString() === menuItemId);

        if (menuItemIndex !== -1) {
            cart.menuItems[menuItemIndex].quantity += quantity;
            cart.menuItems[menuItemIndex].amount = menuItem.price * cart.menuItems[menuItemIndex].quantity;
        }else {
            cart.menuItems.push({
                menuItem: menuItemId,
                quantity,
                amount: menuItem.price * quantity,
            })
        }

        await cart.save()
        res.json(cart)

    } catch (error) {
        console.log(error);
        res.json({error: error.message});
    }
}

exports.getCart = async(req, res)=>{
    try {
        const cart = await Cart.findOne({user: req.user.id}).populate("menuItems.menuItem")
        if (!cart) {
            return res.json("Cart not found")
        }

        res.json(cart)
    } catch (error) {
        res.json("Server Error") 
    }
}

exports.updateQuantity = async (req, res) => {
    const { menuItemId, quantity } = req.body;
    try {
        const cart = await Cart.findOne({user: req.user.id})
        const cartItem = cart.menuItems.find((item) => item.menuItem.toString() === menuItemId)
        const menuItem = await MenuItem.findById(menuItemId)
        if (cartItem) {
           cartItem.quantity = quantity;
           cartItem.amount = menuItem.price * cartItem.quantity
           await cart.save();
           const updatedCart = await Cart.findOne({ user: req.user.id }).populate("menuItems.menuItem");
           res.json(updatedCart)
        } else {
            res.json("item not found")
        }
    } catch (error) {
        res.json("server error")
    }
} 

exports.removeItem = async (req, res) => {
    const { menuItemId } = req.body;
    try {
        const cart = await Cart.findOne({ user: req.user.id })
        cart.menuItems = cart.menuItems.filter((item) => item.menuItem.toString() !== menuItemId)  
        await cart.save();
        const updatedCart = await Cart.findOne({user: req.user.id }).populate("menuItems.menuItem")
        res.json(updatedCart)
    } catch (error) {
        res.json("server error")
    }
}
