import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{
        type: String, 
        required: true,
    },
    email: {
        type: String, 
        required: true,
        unique: true,
    },
    role: {
        type: String, 
        required: true,
        enum: ["user", "owner"],
        default: "user"
    },
    password: {
        type: String,
        required:true
    },
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                // Allow empty for users
                if (this.role === "user" && !v) return true;
                return /^\+234\d{10}$/.test(v); // Must match +234XXXXXXXXXX
            },
            message: props => `${props.value} is not a valid Nigerian phone number!`
        }
    },
    loyaltyPoints: {
        type: Number,
        default: 0,
        min: 0
    }
}, {timestamps: true})

const User = mongoose.model("User", userSchema)
export default User;