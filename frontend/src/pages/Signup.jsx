import React, { useContext, useState, useEffect } from 'react'
import { Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'

const Signup = () => {
  const { axios, navigate } = useContext(AppContext)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: ""
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    criteria: {},
    strength: 'weak'
  })

  // Real-time password validation
  const validatePasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      minLengthForStrong: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }

    const mainCriteria = ['length', 'uppercase', 'lowercase', 'numbers', 'specialChars']
    const score = mainCriteria.filter(criterion => criteria[criterion]).length
    
    let strength = 'weak'
    let isValid = false
    
    if (criteria.length && score >= 5) {
      isValid = true
      if (score === 5 && criteria.minLengthForStrong) {
        strength = 'strong'
      } else {
        strength = 'medium'
      }
    }
    
    return { isValid, criteria, score, strength }
  }

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(validatePasswordStrength(formData.password))
    } else {
      setPasswordStrength({ isValid: false, criteria: {}, strength: 'weak' })
    }
  }, [formData.password])

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    
    // Client-side password validation
    if (!passwordStrength.isValid) {
      toast.error("Please use a stronger password")
      return
    }
    
    try {
      const { data } = await axios.post("/api/user/signup", formData)
      if (data.success) {
        toast.success(data.message)
        navigate("/login")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred")
    }
  }

  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'strong': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      default: return 'text-red-500'
    }
  }

  const getStrengthBarColor = () => {
    switch (passwordStrength.strength) {
      case 'strong': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-red-500'
    }
  }

  const getStrengthWidth = () => {
    switch (passwordStrength.strength) {
      case 'strong': return 'w-full'
      case 'medium': return 'w-2/3'
      default: return 'w-1/3'
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <form onSubmit={submitHandler} className="max-w-96 w-full mx-auto mt-36 mb-24 text-center border border-gray-300/60 rounded-2xl px-8 bg-gray-900">
        <h1 className="text-[#fcae26] text-3xl mt-10 font-medium">SignUp</h1>
        <p className="text-gray-300 text-sm mt-2">Please sign up to continue</p>

        <div className="flex items-center w-full mt-10 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <User className='w-4 h-4 text-gray-800'/>
          <input 
            type="text" 
            name='name' 
            value={formData.name} 
            onChange={onChangeHandler} 
            placeholder="Your Full Name" 
            className="bg-transparent text-gray-700 placeholder-gray-700 outline-none text-sm w-full h-full" 
            required 
          />                 
        </div>

        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <Mail className='w-4 h-4 text-gray-800'/>
          <input 
            type="email" 
            name='email' 
            value={formData.email} 
            onChange={onChangeHandler} 
            placeholder="Email id" 
            className="bg-transparent text-gray-700 placeholder-gray-700 outline-none text-sm w-full h-full" 
            required 
          />                 
        </div>

        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 pr-2 gap-2">
          <select 
            name="role" 
            onChange={onChangeHandler} 
            value={formData.role} 
            className="bg-transparent text-gray-700 placeholder-gray-700 outline-none text-sm w-full h-full cursor-pointer" 
            required
          >
            <option className='bg-gray-700 text-gray-200' value="">Select your role</option>
            <option className='bg-gray-700 text-gray-200' value="user">User</option>
            <option className='bg-gray-700 text-gray-200' value="owner">Owner</option>
          </select>                 
        </div>

        {formData.role === "owner" && (
          <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChangeHandler}
              pattern="^0\d{10}$"
              placeholder="Enter phone number (e.g., 08123456789)"
              className="bg-transparent text-gray-700 placeholder-gray-700 outline-none text-sm w-full h-full"
              required={formData.role === "owner"}
            />
          </div>
        )}
    
        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 pr-3 gap-2">
          <Lock className='w-4 h-4 text-gray-800'/>
          <input 
            type={showPassword ? "text" : "password"} 
            name='password' 
            value={formData.password} 
            onChange={onChangeHandler} 
            placeholder="Password" 
            className="bg-transparent text-gray-700 placeholder-gray-700 outline-none text-sm w-full h-full" 
            required 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>                 
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-3 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-300">Password Strength:</span>
              <span className={`text-xs font-medium ${getStrengthColor()}`}>
                {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
              </span>
            </div>
            
            {/* Strength Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()} ${getStrengthWidth()}`}></div>
            </div>
            
            {/* Criteria Checklist */}
            <div className="space-y-1">
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.criteria.length ? 'text-green-400' : 'text-gray-400'}`}>
                {passwordStrength.criteria.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.criteria.uppercase ? 'text-green-400' : 'text-gray-400'}`}>
                {passwordStrength.criteria.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>One uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.criteria.lowercase ? 'text-green-400' : 'text-gray-400'}`}>
                {passwordStrength.criteria.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>One lowercase letter</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.criteria.numbers ? 'text-green-400' : 'text-gray-400'}`}>
                {passwordStrength.criteria.numbers ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>One number</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordStrength.criteria.specialChars ? 'text-green-400' : 'text-gray-400'}`}>
                {passwordStrength.criteria.specialChars ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>One special character</span>
              </div>
              {passwordStrength.strength === 'medium' && (
                <div className={`flex items-center gap-2 text-xs ${passwordStrength.criteria.minLengthForStrong ? 'text-green-400' : 'text-gray-400'}`}>
                  {passwordStrength.criteria.minLengthForStrong ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>10+ characters (for strong password)</span>
                </div>
              )}
            </div>
          </div>
        )}
    
        <button 
          type="submit" 
          disabled={!passwordStrength.isValid}
          className={`mt-4 w-full h-11 rounded-full cursor-pointer transition-all duration-200 ${
            passwordStrength.isValid 
              ? 'bg-[#fcae26] text-white hover:bg-[#e09920]' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Signup
        </button>
        <p className="text-gray-500 text-sm mt-3 mb-11">
          Already have an account?{" "}
          <Link to={'/login'} className="text-[#fcae26] hover:underline">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Signup