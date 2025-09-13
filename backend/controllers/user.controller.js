import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Password strength validation function
const validatePasswordStrength = (password) => {
    const criteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /\d/.test(password),
        specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(criteria).filter(Boolean).length;
    
    // Password is valid if it meets at least 4 criteria and has minimum length
    const isValid = score >= 4 && criteria.length;
    
    return {
        isValid,
        criteria,
        score,
        strength: isValid ? (score === 5 && password.length >= 10 ? 'strong' : 'medium') : 'weak'
    };
};

// Signup function
export const signup = async( req, res ) => {
    try {
        const { name, email, password, role, phone } = req.body
        
        // Basic field validation
        if ( !name || !email || !password || !role ) {
            return res.json({ message: "All fields are required", success: false })
        }
        
        // Phone validation for owners
        if (role === "owner" && !phone) {
            return res.json({ message: "Phone number is required for owners", success: false });
        }

        // Password strength validation
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            const missing = [];
            if (!passwordValidation.criteria.length) missing.push('at least 8 characters');
            if (!passwordValidation.criteria.uppercase) missing.push('uppercase letter');
            if (!passwordValidation.criteria.lowercase) missing.push('lowercase letter');
            if (!passwordValidation.criteria.numbers) missing.push('number');
            if (!passwordValidation.criteria.specialChars) missing.push('special character');
            
            return res.json({ 
                message: `Password must contain: ${missing.join(', ')}`, 
                success: false 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.json({ message: "User already exists", success: false })
        }

        // Phone number formatting for Nigerian numbers
        let formattedPhone = null;
        if (role === "owner") {
            // Remove spaces and any non-digit characters
            let cleanPhone = phone.replace(/\D/g, "");

            // Remove leading zero
            if (cleanPhone.startsWith("0")) {
                cleanPhone = cleanPhone.substring(1);
            }

            // Prepend +234
            formattedPhone = "+234" + cleanPhone;

            // Validate final format (should be +234XXXXXXXXXX)
            if (!/^\+234\d{10}$/.test(formattedPhone)) {
                return res.json({ message: "Invalid Nigerian phone number format", success: false });
            }
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 12) // Increased salt rounds for better security
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            phone: formattedPhone,
            loyaltyPoints: 0 // Initialize loyalty points
        })
        await newUser.save()

        return res.json({ 
            message: "User created successfully", 
            success: true,
            passwordStrength: passwordValidation.strength 
        })
    } catch (error) {
        console.error('Signup error:', error);
        return res.json({ message: "Internal server error", success: false })
    }
}

// Login function
export const login = async( req, res ) => {
    try {
        const {email, password} = req.body
        if (!email || !password) {
            return res.json({ message: "All fields are required", success: false })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ message: "User not found", success: false })
        }
        
        const isMatch = await bcrypt.compare( password, user.password )
        if (!isMatch) {
            return res.json({ message: "Invalid password", success: false })
        }
        
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            {
                expiresIn: "1d"
            }
        )
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict' // CSRF protection
        })

        return res.json({ message: "Login successful", success: true, user })
    } catch (error) {
        console.error('Login error:', error);
        return res.json({ message: "Internal server error", success: false })
    }
}

// Logout function
export const logout = async( req, res ) => {
    try {
        res.clearCookie("token")
        return res.json({ message: "Logout successful", success: true })
    } catch (error) {
        console.error('Logout error:', error);
        return res.json({ message: "Internal server error", success: false })
    }
}

// isAuth function
export const isAuth = async (req, res) => {
    try {
        const { id } = req.user
        const user = await User.findById(id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        res.json({ success: true, user })
    } catch (error) {
        console.error('Auth check error:', error);
        return res.json({ message: "Internal server error", success: false })
    }
}

// isAuthOwner function
export const isAuthOwner = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const owner = user.role === "owner";
        return res.json({ success: true, owner });
    } catch (error) {
        console.error('Owner auth check error:', error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Update user profile function
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { name, email, phone } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.json({ message: "Name and email are required", success: false });
        }

        // Check if email is being changed and if it already exists
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
            return res.json({ message: "Email already in use", success: false });
        }

        // Phone number formatting for Nigerian numbers (if provided)
        let formattedPhone = phone;
        if (phone && phone.trim()) {
            // Remove spaces and any non-digit characters
            let cleanPhone = phone.replace(/\D/g, "");

            // Remove leading zero
            if (cleanPhone.startsWith("0")) {
                cleanPhone = cleanPhone.substring(1);
            }

            // Prepend +234
            formattedPhone = "+234" + cleanPhone;

            // Validate final format (should be +234XXXXXXXXXX)
            if (!/^\+234\d{10}$/.test(formattedPhone)) {
                return res.json({ message: "Invalid Nigerian phone number format", success: false });
            }
        }

        const updateData = {
            name,
            email,
            ...(formattedPhone && { phone: formattedPhone })
        };

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, select: "-password" }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        return res.json({ 
            message: "Profile updated successfully", 
            success: true, 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.json({ message: "Internal server error", success: false });
    }
};

// Function to award loyalty points (called from booking controller)
export const awardLoyaltyPoints = async (userId, points = 1) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            { $inc: { loyaltyPoints: points } },
            { new: true }
        );
        return true;
    } catch (error) {
        console.error('Error awarding loyalty points:', error);
        return false;
    }
};

// Function to redeem loyalty points
export const redeemLoyaltyPoints = async (req, res) => {
    try {
        const { id } = req.user;
        const { pointsToRedeem } = req.body;

        if (!pointsToRedeem || pointsToRedeem < 5) {
            return res.json({ 
                message: "Minimum 5 points required for redemption", 
                success: false 
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (user.loyaltyPoints < pointsToRedeem) {
            return res.json({ 
                message: "Insufficient loyalty points", 
                success: false 
            });
        }

        // Calculate discount (e.g., 1% per point, max 50%)
        const discountPercentage = Math.min(pointsToRedeem * 1, 50);

        return res.json({
            message: "Discount calculated successfully",
            success: true,
            discountPercentage,
            pointsToRedeem
        });
    } catch (error) {
        console.error('Redeem loyalty points error:', error);
        return res.json({ message: "Internal server error", success: false });
    }
};

// Function to use loyalty points (called after successful booking with discount)
export const useLoyaltyPoints = async (userId, pointsUsed) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            { $inc: { loyaltyPoints: -pointsUsed } },
            { new: true }
        );
        return true;
    } catch (error) {
        console.error('Error using loyalty points:', error);
        return false;
    }
};