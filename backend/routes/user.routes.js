import express from "express"
import { isAuth, isAuthOwner, login, logout, signup, updateProfile, redeemLoyaltyPoints } from "../controllers/user.controller.js"
import { isAuthenticated } from "../middlewares/isAuthenticated.js"

const userRouter = express.Router()

userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.get("/is-auth", isAuthenticated, isAuth)
userRouter.get("/is-auth-owner", isAuthenticated, isAuthOwner)
userRouter.get("/logout", isAuthenticated, logout)
userRouter.put("/update-profile", isAuthenticated, updateProfile)
userRouter.post("/redeem-loyalty-points", isAuthenticated, redeemLoyaltyPoints)

export default userRouter