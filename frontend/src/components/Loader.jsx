import React, { useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const Loader = () => {
    const { navigate, axios } = useContext(AppContext)
    const { nextUrl } = useParams()

    useEffect(() => {
        const verifyPayment = async () => {
            // Get URL parameters to check for Paystack reference
            const urlParams = new URLSearchParams(window.location.search)
            const reference = urlParams.get('reference')
            
            if (reference) {
                try {
                    const { data } = await axios.post('/api/bookings/verify-payment', { reference })
                    if (data.success) {
                        toast.success('Payment verified successfully!')
                    } else {
                        toast.error('Payment verification failed')
                    }
                } catch (error) {
                    console.error('Payment verification error:', error)
                    toast.error('Failed to verify payment')
                }
            }
        }

        verifyPayment()

        if (nextUrl) {
            setTimeout(() => {
                navigate(`/${nextUrl}`)
            }, 3000) 
        }
    }, [nextUrl, navigate, axios])

    return (
        <div className='bg-gray-900 flex flex-col items-center justify-center h-screen'>
            <div className='animate-spin rounded-full w-24 h-24 border-4 border-gray-200 border-t-[#fcae26] mb-4'>
            </div>
            <p className='text-gray-200 text-lg'>Processing your payment...</p>
        </div>
    )
}

export default Loader

// import React, { useContext, useEffect } from 'react'
// import { AppContext } from '../context/AppContext'
// import { useParams } from 'react-router-dom'

// const Loader = () => {
//     const{ navigate } = useContext(AppContext)
//     const { nextUrl } = useParams()

//     useEffect(() => {
//         if (nextUrl) {
//             setTimeout(() => {
//                 navigate(`/${nextUrl}`)
//             }, 8000);
//         }
//     }, [nextUrl])
//   return (
//     <div className='bg-gray-900 flex items-center justify-center h-screen'>
//         <div className='animate-spin roundeed-full w-24 h-24 border-4 border-gray-200 border-t-[#fcae26]'>

//         </div>
//     </div>
//   )
// }

// export default Loader