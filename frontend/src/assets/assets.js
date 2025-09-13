import add_icon from "./add_icon.png";
import bath_icon from "./bath_icon.png";
import bed_icon from "./bed_icon.png";
import calendar_icon from "./calendar_icon.png";
import camera_icon from "./camera_icon.png";
import dashboard_icon from "./dashboard_icon.png";
import delete_icon from "./delete_icon.png";
import dining_icon from "./dining_icon.png";
import edit_icon from "./edit_icon.png";
import freezer_icon from "./freezer_icon.png";
import hero_img from "./hero_img.png";
import img1 from "./img1.png";
import img2 from "./img2.png";
import img3 from "./img3.png";
import location_icon from "./location_icon.png";
import location from "./location.png";
import logo from "./logo.png";
import meter_icon from "./meter_icon.png";
import offer_img1 from "./offer_img1.png";
import offer_img2 from "./offer_img2.png";
import offer_img3 from "./offer_img3.png";
import offer_img4 from "./offer_img4.png";
import offer_img5 from "./offer_img5.png";
import profile_icon from "./profile_icon.png";
import room_icon from "./room_icon.png";
import tv_icon from "./tv_icon.png";
import user_icon from "./user_icon.png";
import users_icon from "./users_icon.png";
import wifi_icon from "./wifi_icon.png";

export const assets = {
  hero_img,
  user_icon,
  location,
  calendar_icon,
  profile_icon,
  add_icon,
  delete_icon,
  edit_icon,
  logo,
  freezer_icon,
  dashboard_icon,
  users_icon,
  camera_icon,
  location_icon
};

export const cities = [
  "Ibadan",
];
export const homePageData = [
  {
    icon: users_icon,
    title: "users",
    value: "2500",
  },
  {
    icon: camera_icon,
    title: "treasures",
    value: "400",
  },
  {
    icon: location_icon,
    title: "cities",
    value: "200",
  },
];
export const hotelsPageData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",
    name: "Grand Palace Hotel",
    address: "123 Royal Street, Manhattan, New York, NY 10001",
    rating: 4.8,
    price: "₦500,000",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    ownerName: "Robert Wilson",
    contactNumber: "+1 (555) 123-4567",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop",
    name: "Ocean View Resort",
    address: "456 Beachfront Ave, Miami Beach, FL 33139",
    rating: 4.6,
    price: "₦450,000",
    amenities: ["WiFi", "Beach Access", "Pool", "Bar"],
    ownerName: "Maria Rodriguez",
    contactNumber: "+1 (555) 987-6543",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop",
    name: "Mountain Lodge Retreat",
    address: "789 Pine Valley Road, Aspen, CO 81611",
    rating: 4.7,
    price: "₦750,000",
    amenities: ["WiFi", "Fireplace", "Ski Access", "Restaurant"],
    ownerName: "David Thompson",
    contactNumber: "+1 (555) 456-7890",
  },
];
export const hotelsData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",
    name: "Grand Palace Hotel",
    address: "123 Royal Street, Manhattan, New York, NY 10001",
    rating: 4.8,
    price: "₦500,000",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    ownerName: "Robert Wilson",
    contactNumber: "+1 (555) 123-4567",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop",
    name: "Ocean View Resort",
    address: "456 Beachfront Ave, Miami Beach, FL 33139",
    rating: 4.6,
    price: "₦450,000",
    amenities: ["WiFi", "Beach Access", "Pool", "Bar"],
    ownerName: "Maria Rodriguez",
    contactNumber: "+1 (555) 987-6543",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop",
    name: "Mountain Lodge Retreat",
    address: "789 Pine Valley Road, Aspen, CO 81611",
    rating: 4.7,
    price: "₦750,000",
    amenities: ["WiFi", "Fireplace", "Ski Access", "Restaurant"],
    ownerName: "David Thompson",
    contactNumber: "+1 (555) 456-7890",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop",
    name: "Downtown Business Inn",
    address: "321 Commerce Street, Chicago, IL 60601",
    rating: 4.3,
    price: "₦1,000,000",
    amenities: ["WiFi", "Business Center", "Gym", "Parking"],
    ownerName: "Jennifer Chen",
    contactNumber: "+1 (555) 234-5678",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop",
    name: "Historic Boutique Hotel",
    address: "567 Heritage Lane, Savannah, GA 31401",
    rating: 4.9,
    price: "₦400,000",
    amenities: ["WiFi", "Historic Tours", "Garden", "Restaurant"],
    ownerName: "Michael Anderson",
    contactNumber: "+1 (555) 345-6789",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop",
    name: "Luxury City Suites",
    address: "890 Executive Blvd, Los Angeles, CA 90210",
    rating: 4.5,
    price: "₦600,000",
    amenities: ["WiFi", "Concierge", "Rooftop Pool", "Valet"],
    ownerName: "Sarah Johnson",
    contactNumber: "+1 (555) 567-8901",
  },
];
export const roomsPageData = [
  {
     _id: "67f7647c197ac559e4089b96",
    hotel: hotelsData[0],
    roomType: "Deluxe Suite",
    pricePerNight: "450,000",
    description:
      "Experience luxury at its finest in our Deluxe Suite. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: ["Ocean View", "Balcony", "Mini Bar", "Room Service"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:26:04.013Z",
    updatedAt: "2025-04-10T06:26:04.013Z",
    __v: 0,
  },
  {
    _id: "67f76385197ac559e4089b6a",
    hotel: hotelsData[5],
    roomType: "Penthouse Suite",
    pricePerNight: "650,000",
    description:
      "Experience luxury at its finest in our Deluxe Suite. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: [
      "Panoramic View",
      "Private Terrace",
      "Butler Service",
      "Jacuzzi",
    ],
    images: [
      "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:21:57.442Z",
    updatedAt: "2025-04-10T06:21:57.442Z",
    __v: 0,
  },
  {
     _id: "67f76452197ac559e4089b8e",
    hotel: hotelsData[1],
    roomType: "Executive Room",
    pricePerNight: "350,000",
    description:
      "Experience luxury at its finest in our Deluxe Suite. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: ["City View", "Work Desk", "Premium WiFi", "Concierge Service"],
    images: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:25:22.593Z",
    updatedAt: "2025-04-10T06:25:22.593Z",
    __v: 0,
  }
];
export const roomsData = [
  {
    _id: "67f7647c197ac559e4089b96",
    hotel: hotelsData[0],
    roomType: "Deluxe Suite",
    pricePerNight: "450,000",
    description:
      "Experience luxury at its finest in our Deluxe Suite. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: ["Ocean View", "Balcony", "Mini Bar", "Room Service"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:26:04.013Z",
    updatedAt: "2025-04-10T06:26:04.013Z",
    __v: 0,
  },
  {
    _id: "67f76452197ac559e4089b8e",
    hotel: hotelsData[1],
    roomType: "Executive Room",
    pricePerNight: "350,000",
    description:
      "Experience luxury at its finest in our Executive Room. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: ["City View", "Work Desk", "Premium WiFi", "Concierge Service"],
    images: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:25:22.593Z",
    updatedAt: "2025-04-10T06:25:22.593Z",
    __v: 0,
  },
  {
    _id: "67f76406197ac559e4089b82",
    hotel: hotelsData[2],
    roomType: "Standard Double",
    pricePerNight: "280,000",
    description:
      "Experience luxury at its finest in our Standard Double Room. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: ["Mountain View", "Free WiFi", "Breakfast Included", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop",
    ],
    isAvailable: false,
    createdAt: "2025-04-10T06:24:06.285Z",
    updatedAt: "2025-04-10T06:24:06.285Z",
    __v: 0,
  },
  {
    _id: "67f763d8197ac559e4089b7a",
    hotel: hotelsData[3],
    roomType: "Premium Single",
    pricePerNight: "220,000",
    description:
      "Experience luxury at its finest in our Premium Single Suite. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: ["Garden View", "Smart TV", "Room Service", "Spa Access"],
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:23:20.252Z",
    updatedAt: "2025-04-10T06:23:20.252Z",
    __v: 0,
  },
  {
    _id: "67f763a1197ac559e4089b72",
    hotel: hotelsData[4],
    roomType: "Family Suite",
    pricePerNight: "380,000",
    description:
      "Experience luxury at its finest in our Family Suite. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: ["Pool Access", "Kitchen", "Living Area", "Free Breakfast"],
    images: [
      "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1559508551-44bff1de756b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400&h=300&fit=crop",
    ],
    isAvailable: false,
    createdAt: "2025-04-10T06:22:25.185Z",
    updatedAt: "2025-04-10T06:22:25.185Z",
    __v: 0,
  },
  {
    _id: "67f76385197ac559e4089b6a",
    hotel: hotelsData[5],
    roomType: "Penthouse Suite",
    pricePerNight: "650,000",
    description:
      "Experience luxury at its finest in our Penthouse Suite. This spacious room features premium amenities, stunning ocean views, and elegant furnishing designed for the discerning traveler. Perfect for couples seeking a romantic getaway or business travelers who appreciate comfort and style.",
    amenities: [
      "Panoramic View",
      "Private Terrace",
      "Butler Service",
      "Jacuzzi",
    ],
    images: [
      "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:21:57.442Z",
    updatedAt: "2025-04-10T06:21:57.442Z",
    __v: 0,
  },
];
export const bookingData = [
  {
    _id: "67f76839994a731e97d3b8ce",

    room: roomsData[1],
    hotel: hotelsData[1],
    checkInDate: "2025-04-30T00:00:00.000Z",
    checkOutDate: "2025-05-01T00:00:00.000Z",
    totalPrice: "350,000",
    guests: 2,
    status: "confirmed",
    paymentMethod: "Paystack",
    isPaid: true,
    createdAt: "2025-04-10T06:42:01.529Z",
    updatedAt: "2025-04-10T06:43:54.520Z",
    __v: 0,
  },
  {
    _id: "67f76829994a731e97d3b8c3",

    room: roomsData[0],
    hotel: hotelsData[0],
    checkInDate: "2025-04-27T00:00:00.000Z",
    checkOutDate: "2025-04-28T00:00:00.000Z",
    totalPrice: "450,000",
    guests: 1,
    status: "pending",
    paymentMethod: "Pay At Hotel",
    isPaid: false,
    createdAt: "2025-04-10T06:41:45.873Z",
    updatedAt: "2025-04-10T06:41:45.873Z",
    __v: 0,
  },
  {
    _id: "67f76810994a731e97d3b8b4",

    room: roomsData[2],
    hotel: hotelsData[2],
    checkInDate: "2025-04-11T00:00:00.000Z",
    checkOutDate: "2025-04-12T00:00:00.000Z",
    totalPrice: "280,000",
    guests: 1,
    status: "cancelled",
    paymentMethod: "Pay At Hotel",
    isPaid: false,
    createdAt: "2025-04-10T06:41:20.501Z",
    updatedAt: "2025-04-10T06:41:20.501Z",
    __v: 0,
  },
];
