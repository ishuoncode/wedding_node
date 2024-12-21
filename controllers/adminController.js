// const Banquet = require('../models/banquetModal');
// const Decorator = require('../models/decoratorModal');
// const Caterer = require('../models/catererModal');
// const Photographer = require('../models/photographerModal');
// const AppError = require("../utils/appError");
const User = require('../models/userModal');
const catchAsync = require('./../utils/catchAsync');

exports.transferOwnership = catchAsync(async (req, res) =>{
    const {category,categoryId , fromUserId , toUserId } = req.body
    const [fromUser, toUser] = await Promise.all([
        User.findById(fromUserId),
        User.findById(toUserId)
    ]);
    if (!fromUser || !toUser) {
        return res.status(404).json({
            success: false,
            message: 'One or both users not found.'
        });
    }
    const categoryIndex = fromUser.post[category].findIndex(item => item.toString() === categoryId);
    if (categoryIndex !== -1) {
        
        fromUser.post[category].splice(categoryIndex, 1);

      
        toUser.post[category].push(categoryId);

       
        await Promise.all([fromUser.save(), toUser.save()]);

        return res.status(200).json({
            success: true,
            message: 'Ownership transferred successfully.'
        });
    }
})