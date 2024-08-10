const MenuItem = require('../models/menuItem')
const { validateMenuItem } = require("../validator")

exports.CreateMenuItem = async (req, res)=> {
    const {error} = validateMenuItem(req.body)
        if (error) { 
            res.json(error.details[0].message)
        }else{
            try {
                const menuItem = new MenuItem({
                    category: req.body.category,
                    name: req.body.name,
                    description: req.body.description,  
                    price: req.body.price,
                    img:req.file.path,
                    restaurant: req.body.restaurant
                })
        
                const food = await menuItem.save()
                res.setHeader("Content-type", "application/json");

                res.json(food)
            } catch (error) {
                console.log({message: error.message});
            }  
                
        }
}

exports.getMenuItem = async (req, res)=>{
    try {
        const menuItem = await MenuItem.find()
        res.json(menuItem)
        
    } catch (error) {
        res.json({message: error.message}); 
    }
}

exports.getMenuItem = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({restaurant: req.params.restaurantId})
        res.json(menuItems)
    } catch (error) {
        res.json({message: error.message})
    }
}

exports.getAllMenuItem = async (req, res) => {
    try {
        const menuItems = await MenuItem.find()
        res.json(menuItems)
    } catch (error) {
        res.json({message: error.message})
    }
}

exports.removeMenuItem = async (req, res)=>{
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id)
        if (!menuItem) {
            return res.json("no menuItem found")
        }
    } catch (error) {
        res.json({message: error.message})
    }
}

// exports.getMenuItemByRestaurant = async (req, res) => {
//     try {
//         const {restaurantId} = req.params
//         const menuItems = await MenuItem.find({restaurantId})
//         res.json(menuItems)
//     } catch (error) {
//         res.json({message: error.message})
//     }
// }

