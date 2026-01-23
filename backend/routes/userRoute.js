let express = require("express")
const userController = require("../controller/userController")

let userRouter = express.Router()

// register user
userRouter.post("/api/v1/users/register", userController.register)

// login user
userRouter.post("/api/v1/users/login", userController.login)

// update user
userRouter.put("/api/v1/users/update/:userId", userController.update)

// get user details
userRouter.get("/api/v1/users/:userId", userController.getUser)


module.exports = userRouter