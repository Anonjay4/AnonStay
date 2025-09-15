import React, { useContext, useState } from "react";
import {assets} from "../assets/assets.js"
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import toast from "react-hot-toast";
const Navbar = () => {

    const { navigate, user, setUser, axios, owner, setOwner } = useContext(AppContext)
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Hotels', path: '/hotels' },
        { name: 'Rooms', path: '/rooms' },
        { name: 'About', path: '/about' },
    ];

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const logout = async () => {
        try {
            const {data} = await axios.get("/api/user/logout")
            if (data.success) {
                toast.success(data.message)
                setUser(false)
                setOwner(false)
                navigate("/")
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
            <nav className={`fixed top-0 left-0 bg-yellow-700 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 text-white py-4 md:py-6 h-20`}>

                {/* Logo */}
                <button onClick={backToTOp}>
                    <Link to="/" className="flex items-center gap-2">
                        <img src={assets.logo} alt="logo" className={`h-40 w-auto`} />
                    </Link>
                </button>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8">
                    {navLinks.map((link, i) => (
                        <Link onClick={backToTOp} key={i} to={link.path} className={`group flex flex-col gap-0.5 text-white`}>
                            {link.name}
                            <div className={` bg-white h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
                        </Link>
                    ))}

                    {
                        owner?(
                            <button onClick={()=> navigate("/owner")} className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer text-white transition-all`}>
                                Owner
                            </button>
                        )
                        : ""
                    }
                </div>

                {/* Desktop Right */}
                <div className="hidden md:flex items-center gap-4">
                    {
                        owner || user?(
                            <div className="relative group inline-block">
                                <img src={assets.profile_icon} alt="" className="w-12 h-12 rounded-full cursor-pointer"/>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 w-40 bg-gray-800 shadow-lg rounded-md opacity-0 group-hover:opacity-100 group-hover:visible invisible transition duration-300 z-50">
                                    <ul className="py-2">
                                        <li>
                                            <Link className="block px-4 py-2 text-sm text-white hover:bg-gray-950" to={"/profile"} onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                                        </li>
                                        <li>
                                            <Link className="block px-4 py-2 text-sm text-white hover:bg-gray-950" to={"/my-bookings"}>My Bookings</Link>
                                        </li>
                                        <li onClick={ logout }>
                                            <Link className="block px-4 py-2 text-sm text-white hover:bg-gray-950" >Logout</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ):(
                            <button onClick={()=> navigate("/login")} className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500  bg-white text-black cursor-pointer hover:bg-[#fcae26] hover:text-white `}>
                                Login
                            </button>
                        )
                    }
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-3 md:hidden">
                    <svg onClick={() => setIsMenuOpen(!isMenuOpen)} className={`h-6 w-6 cursor-pointer `} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                    </svg>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed top-0 left-0 w-full h-screen bg-gray-900 text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-white transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {navLinks.map((link, i) => (
                        <Link key={i} to={link.path} onClick={() => setIsMenuOpen(false)}>
                            {link.name}
                        </Link>
                    ))}

                    {
                        owner?(
                            <button onClick={()=> navigate("/owner")} className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer text-white transition-all`}>
                                Owner
                            </button>
                        )
                        : ""
                    }

                    <div className="flex md:hidden items-center gap-4">
                        {
                            owner || user?(
                                <div className="relative group inline-block">
{/*                                     <img src={assets.profile_icon} alt="" className="w-12 h-12 rounded-full cursor-pointer"/> */}
                                    <ul className="py-2">
                                        <li className="border rounded-full cursor-pointer text-white transition-all mb-4 flex items-center justify-center">
                                            <Link className="block px-2 py-2 text-sm text-white hover:bg-gray-950" to={"/profile"} onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                                        </li>
                                        <li className="border rounded-full cursor-pointer text-white transition-all mb-4 flex items-center justify-center">
                                            <Link className="block px-2 py-2 text-sm text-white hover:bg-gray-950" to={"/my-bookings"}onClick={() => setIsMenuOpen(false)}>My Bookings</Link>
                                        </li>
                                        <li className="border rounded-full cursor-pointer text-white transition-all mb-2 flex items-center justify-center" onClick={ logout }>
                                            <Link className="block px-2 py-2 text-sm text-white hover:bg-gray-950" onClick={() => setIsMenuOpen(false)}>Logout</Link>
                                        </li>
                                    </ul>

                                    {/* Dropdown Menu */}
{/*                                     <div className="absolute right-0 mt-2 w-40 bg-gray-800 shadow-lg rounded-md opacity-0 group-hover:opacity-100 group-hover:visible invisible transition duration-300 z-50">
                                        
                                    </div> */}
                                </div>
                            ):(
                                <Link to={'/login'} onClick={() => setIsMenuOpen(false)}>
                                    <button className={`border px-4 py-1 rounded-full transition-all cursor-pointer bg-[#fcae26] text-white `}>
                                        Login
                                    </button>
                                </Link>
                            )
                        }
                    </div>
                </div>
            </nav>
    );
}
export default Navbar
