const Joi = require("joi")

const validator = (schema) => (payload) => schema.validate(payload)

const categorySchema = Joi.object({
    name: Joi.string().required()
})

const menuSchema = Joi.object({
    name: Joi.string().required(),
    img: Joi.string(),
    africanDelight: Joi.boolean(),
    westernCuisine: Joi.boolean()
})

const restaurantSchema = Joi.object({
    name: Joi.string().required(),
    img: Joi.string(),
    rating: Joi.number().required(),
    // operatingHours: Joi.array().items(
    //     Joi.object({
    //         day: Joi.string().required(),
    //         hours: Joi.string().required()
    //     })
    // ).required(),
    // location: Joi.object({
    //     lat: Joi.number().required(),
    //     lng: Joi.number().required()
    // }).required()
});

const menuItemSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    img: Joi.string(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    restaurant: Joi.string().required()
})

exports.validateCategory = validator(categorySchema)
exports.validateMenu = validator(menuSchema)
exports.validateRestaurant = validator(restaurantSchema)
exports.validateMenuItem = validator(menuItemSchema)