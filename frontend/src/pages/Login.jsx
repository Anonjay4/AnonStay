import React, { useContext, useState } from 'react'
import { Mail, Lock, Scroll } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Login = () => {

  const {setUser, setOwner, navigate, axios}=useContext(AppContext)
  const [formData, setFormData]=useState({
    email:"",
    password:""
  })

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]:e.target.value})
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/user/login", formData)
      if (data.success) {
       toast.success(data.message);
       if (data.user.role === "owner") {
        setOwner(true)
        navigate("/owner")
       } else{
        setUser(true)
        navigate("/")
       }
      }else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }
  const backToTOp= ()=>{
        scrollTo(0, 0);
  }
  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
       <form onSubmit={submitHandler} className="max-w-96 w-full mx-auto mt-36 mb-24 text-center border border-gray-300/60 rounded-2xl px-8 bg-gray-900">
            <h1 className="text-[#fcae26] text-3xl mt-10 font-medium">Login</h1>
            <p className="text-gray-300 text-sm mt-2">Please sign in to continue</p>
            <div className="flex items-center w-full mt-10 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <Mail className='w-4 h-4 text-gray-800'/>
                <input type="email" name='email' value={formData.email} onChange={onChangeHandler} placeholder="Email id" className="bg-transparent text-gray-700 placeholder-gray-700 outline-none text-sm w-full h-full" required />                 
            </div>
        
            <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
               <Lock className='w-4 h-4 text-gray-800'/>
                <input type="password" name='password' value={formData.password} onChange={onChangeHandler} placeholder="Password" className="bg-transparent text-gray-700 placeholder-gray-700 outline-none text-sm w-full h-full" required />                 
            </div>
        
            <button onClick={backToTOp} type="submit" className="mt-3 w-full h-11 rounded-full cursor-pointer bg-[#fcae26] text-white">
                Login
            </button>
            <p className="text-gray-500 text-sm mt-3 mb-11">Don’t have an account?{""} <Link to={'/signup'} className="text-[#fcae26]" >Sign up</Link></p>
        </form>
    </div>
  )
}

export default Login