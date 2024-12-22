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


const mongoose = require("mongoose");

exports.transferAllOwnership = catchAsync(async (req, res) => {

    const { sellerId } = req.body;

    if (!sellerId) {
        return res.status(400).json({ status: "error", message: "sellerId is required" });
    }

    // Find the seller
    const seller = await User.findOne({ _id: sellerId, role: "seller" });
    if (!seller) {
        return res.status(404).json({ status: "error", message: "Seller with this user ID not found" });
    }

    // Find the admin
    const admin = await User.findOne({ _id: req.user._id.toString(), role: "admin" });
    if (!admin) {
        return res.status(404).json({ status: "error", message: "Admin not found" });
    }

    // Begin transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Concatenate the seller's posts to the admin's posts
        admin.post.Banquet = admin.post.Banquet.concat(seller.post.Banquet);
        admin.post.Decorator = admin.post.Decorator.concat(seller.post.Decorator);
        admin.post.Photographer = admin.post.Photographer.concat(seller.post.Photographer);
        admin.post.Caterer = admin.post.Caterer.concat(seller.post.Caterer);

        // Save the admin's updated posts
        await admin.save({ session });

        // Now, clear the seller's posts after successful update
        seller.post.Banquet = [];
        seller.post.Decorator = [];
        seller.post.Photographer = [];
        seller.post.Caterer = [];

        // Save the seller's updated posts
        await seller.save({ session });

        // Commit the transaction
        await session.commitTransaction();

        // End the session
        session.endSession();

        return res.status(200).json({ status: "success", message: "Ownership transferred successfully" });
    } catch (error) {
        // If there's any error, abort the transaction
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).json({ status: "error", message: "Failed to transfer ownership" });
    }
});
