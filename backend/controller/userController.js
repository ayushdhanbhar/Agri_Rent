const User = require("../models/user")
let asyncHandler = require("express-async-handler")
let jwt = require("jsonwebtoken")
let bcrypt = require("bcrypt")

let userController = {
    register: asyncHandler(async (req, res) => {
        let { name, email, phone, password, role, taluka, district, village, pincode, state } = req.body
        // hash the password
        let salt = await bcrypt.genSalt(10)
        let hashedPassword = await bcrypt.hash(password, salt)
        let user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            taluka,
            district,
            village,
            pincode,
            state
        })
        // send the response
        res.json({
            "message": "User registered successfully."
        })
    }),
    login: asyncHandler(async (req, res) => {
        let { phone, password } = req.body
        let userExists = await User.findOne({ phone })
        if (!userExists) {
            throw new Error("User not found.")
        }
        let isMatch = await bcrypt.compare(password, userExists.password)
        if (!isMatch) {
            throw new Error("Invalid credentials.")
        }
        // generate token
        let token = jwt.sign({ id: userExists._id }, "agri-rent", { expiresIn: "15m" })
        // send the response
        res.json({
            "message": "User logged in successfully.",
            "token": token,
            "role": userExists.role,
            "user_id": userExists._id,
            "name": userExists.name,
            "district": userExists.district
        })
    }),
    getUser: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password'); // Exclude password from response

        if (user) {
            res.json({
                "message": "User fetched successfully.",
                "data": user
            });
        } else {
            res.status(404).json({
                "message": "User not found."
            });
        }
    }),
    update: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const updates = req.body;

        // Remove password from updates if present to avoid accidental plain text update or complexity
        if (updates.password) delete updates.password;

        const user = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (user) {
            res.json({
                "message": "User updated successfully.",
                "data": user
            });
        } else {
            res.status(404).json({
                "message": "User not found."
            });
        }
    })
}

module.exports = userController