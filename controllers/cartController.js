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
    const { menuItemId, quantity, isAuthenticated, localStorageCart } = req.body;

    try {
        if (!isAuthenticated) {
            // User is not authenticated, so we'll handle the cart using local storage
            let cart = JSON.parse(localStorageCart || '[]');
            
            const menuItemIndex = cart.findIndex(item => item.menuItemId === menuItemId);

            if (menuItemIndex !== -1) {
                // If item is already in the local cart, update quantity and amount
                cart[menuItemIndex].quantity += quantity;
                cart[menuItemIndex].amount += cart[menuItemIndex].price * quantity;
            } else {
                // Otherwise, add a new item to the local cart
                const menuItem = await MenuItem.findById(menuItemId);
                if (!menuItem) {
                    return res.json("Product not found");
                }
                cart.push({
                    menuItemId,
                    quantity,
                    price: menuItem.price,
                    amount: menuItem.price * quantity
                });
            }

            return res.json({ cart });
        } else {
            // User is authenticated, handle cart using the database
            let cart = await Cart.findOne({ user: req.user.id });
            if (!cart) {
                cart = new Cart({ user: req.user.id, menuItems: [] });
            }

            const menuItem = await MenuItem.findById(menuItemId);
            if (!menuItem) {
                return res.json("Product not found");
            }

            const menuItemIndex = cart.menuItems.findIndex(item => item.menuItem.toString() === menuItemId);

            if (menuItemIndex !== -1) {
                // If item is already in the cart, update quantity and amount
                cart.menuItems[menuItemIndex].quantity += quantity;
                cart.menuItems[menuItemIndex].amount = menuItem.price * cart.menuItems[menuItemIndex].quantity;
            } else {
                // Otherwise, add a new item to the cart
                cart.menuItems.push({
                    menuItem: menuItemId,
                    quantity,
                    amount: menuItem.price * quantity,
                });
            }

            await cart.save();
            return res.json(cart);
        }
    } catch (error) {
        console.log(error);
        res.json({ error: error.message });
    }
};

// In your backend controller
exports.syncCart = async (req, res) => {
    const { cartItems } = req.body; // Assuming cartItems is an array of cart items

    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, menuItems: [] });
        }

        cart.menuItems = cartItems.map(item => ({
            menuItem: item.menuItemId,
            quantity: item.quantity,
            amount: item.amount,
        }));

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


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
