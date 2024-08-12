const Menu = require("../models/menu")
const {validateMenu} = require("../validator")

exports.createMenu = async (req,res)=>{
    const {error} = validateMenu(req.body)
        if (error) { 
            res.json(error.details[0].message)
        }else{
            try {
                const menu = new Menu({
                    name: req.body.name,
                    img: req.file.path,  
                    africanDelight: req.body.africanDelight,
                    westernCuisine: req.body.westernCuisine
                })
        
                const menuItem = await menu.save()
                res.setHeader("Content-type", "application/json");

                res.json(menuItem)
            } catch (error) {
                console.log({message: error.message});
            }  
                
        }
}

exports.getAllMenu = async (req, res)=>{
    try {
        const menu = await Menu.find()
        res.json(menu)
        
    } catch (error) {
        res.json({message: error.message}); 
    }
}

exports.getAfricanDelightMenu = async(req, res)=>{
    try {
        const africanDelight = await Menu.find({africanDelight: true}).populate('category')
        res.json(africanDelight)
    } catch (error) {
        res.json({message: error.message})
    }
}

exports.getWesternCuisineMenu = async(req, res)=>{
    try {
        const westernCuisine = await Menu.find({westernCuisine: true}).populate('category')
        res.json(westernCuisine)
    } catch (error) {
        res.json({message: error.message})
    }
}