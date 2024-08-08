const Restaurant = require('../models/restaurant')
const {validateRestaurant} = require("../validator")

exports.CreateRestaurant = async (req, res)=> {
    const {error} = validateRestaurant(req.body)
        if (error) { 
            res.json(error.details[0].message)
        }else{
            try {
                const restaurant = new Restaurant({
                    name: req.body.name,
                    img: req.file.path,  
                    rating: req.body.rating,
                    operatingHours: req.body.operatingHours,
                    location: req.body.location
                })
        
                const food = await restaurant.save()
                res.setHeader("Content-type", "application/json");

                res.json(food)
            } catch (error) {
                console.log({message: error.message});
            }  
                
        }
}

exports.getRestaurant = async (req, res)=>{
    try {
        const restaurant = await Restaurant.find()
        res.json(restaurant)
        
    } catch (error) {
        res.json({message: error.message}); 
    }
}



// exports.updateLocation = async (req, res) => {
//     const {id} = req.params;
//     const {latitude, longitude} = req.body;

//     try {
//         const restaurant = await restaurant.findByIdAndUpdate(
//             id,
//             {location: { latitude, longitude}},
//             {new: true}
//         )
//         if (!restaurant) {
//             return res.json().send('Restaurant not found')
//         }
//         res.json(restaurant)
//     } catch (error) {
//         res.json({message: error.message});
//     }
// }