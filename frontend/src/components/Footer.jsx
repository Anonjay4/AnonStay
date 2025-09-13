import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (

    <footer className="px-20 pt-8 md:px-16 lg:px-36 w-full bg-gray-900 text-gray-300 border-t border-gray-500">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10 ">
                <div className="md:max-w-96">
                    <img alt="logo" className="h-40" src={assets.logo} />
                    <p className="text-sm">
                        AnonStay is dedicated to providing travelers with seamless stays and trusted hospitality, offering comfort, convenience, and personalized service for every journey around the world.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/googlePlayBtnBlack.svg" alt="google play" className="h-10 w-auto border border-white rounded" />
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/appleStoreBtnBlack.svg" alt="app store" className="h-10 w-auto border border-white rounded" />
                    </div>
                </div>
                <div className="flex-1 flex items-start md:justify-end md:mt-14 gap-20 md:gap-40">
                    <div>
                        <h2 className="font-semibold mb-5">Company</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="/">Home</a></li>
                            <li><a href="/about">About us</a></li>
                            <li><a href="/">Contact us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5">Get in touch</h2>
                        <div className="text-sm space-y-2">
                            <p>+234 802 123 4567</p>
                            <p>info@anonstay.com</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5">
                Copyright {new Date().getFullYear()} © <a href="/">AnonStay</a>. All Right Reserved.
            </p>
        </footer>
  )
}

export default Footer