const MenuItem = require('../models/menuItem')
const { validateMenuItem } = require("../validator")

exports.CreateMenuItem = async (req, res) => {
    const { error } = validateMenuItem(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    
    if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
    }

    try {
        const menuItem = new MenuItem({
            category: req.body.category,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            img: req.file.path,
            restaurant: req.body.restaurant
        });

        const food = await menuItem.save();
        res.setHeader("Content-Type", "application/json");
        res.status(201).json(food);
    } catch (error) {
        console.error("Error creating menu item:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getSingleMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: "No menu item found" });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMenuItemByRestaurant = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllMenuItem = async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: "No menu item found" });
        }
        res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

