const nodemailer = require('nodemailer')
const config = require('./../utils/config')

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: config.AUTH_EMAIL,
        pass: config.AUTH_PASS,
    }
})

transporter.verify((error,success)=>{
    if(error){
        console.log(error);
    }else{
        console.log("Ready for Massage ");
        console.log(success);
    }

})


    //send hotel new listing email
const sendNewHotelRegistrationEmail = ({hotelCustomId,category,hotelBasicInfo, email}, res) => {
        const { hotelName,starRating,contactName,contactPhone,altPhone,ManyHotelOptions,streetAddress,city,state,country } = hotelBasicInfo
            //mail options
            const mailOptions = {
            from: config.AUTH_EMAIL,
            to: `${email}`,
            subject: `Confirmation-${hotelCustomId}: Application for New ${category} Listing with Awuf-booking`,
            html: `<p>Thank you for adding a new property with Awuf-booking .</p>
                   <p>Ensure the following basic information about your entries are correct or else, Contact the support immediately .</p>
                   <p> <b> Hotel Registration Number </b>: ${hotelCustomId}. </p>
                   <p> <b> Category Type </b>: ${category}. </p>
                   <p> <b> Hotel Name </b>: ${hotelName}. </p>
                   <p> <b> Star Rating </b>: ${starRating}. </p>
                   <p> <b> Contact Name </b>: ${contactName}. </p>
                   <p> <b> Contact Phone </b>: ${contactPhone}. </p>
                   <p> <b> Alt Phone </b>: ${altPhone}. </p>
                   <p> <b> ManyHotelOptions </b>: ${ManyHotelOptions}. </p>
                   <p> <b> Street Address </b>: ${streetAddress}. </p>
                   <p> <b> City </b>: ${city}. </p>
                   <p> <b> State </b>: ${state}. </p>
                   <p> <b> Country </b> : ${country}. </p>
                   <p> While you wait for Awuf-booking to verify your <b>${category}</b> Property, 
                    Check the Terms and Conditions <a href="https://ravebooking.netlify.app/owners"><b>here</b></a> </p>`,
            } 

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                    res.status(200).json({message:"New Property Confirmation Email has been sent"})
                  console.log('Email sent: ' + info.response);
                }
              })
              
    }

    
    //send new booking email
const sendNewBookingEmail = ({bookingId,email,hotelDetails,roomDetails,userDetails, BookingStatus,price }, res) => {
    const {hotelName, hotelAddress ,hotelCustomId} = hotelDetails
    const {roomType, noOfRooms, nightsNumber, checkIn, checkOut, guestCount } = roomDetails 
    const { firstName, lastName, phoneNumber, gender, address} = userDetails 
    const {cancelReservation, confirmCheckIn, confirmCheckOut} = BookingStatus 
        //mail options
        const mailOptions = {
        from: config.AUTH_EMAIL,
        to: `${email}`,
        subject: `Booking-${bookingId}: You have a  New Booking from Awuf-booking`,
        html: `<p>Your new booking is now available with Awuf-booking .</p>
               <p>Booking details includes of Hotel:<b>${hotelName}</b> , <b>${hotelAddress}</b> , 
               <b>${hotelCustomId}</b> </p>

               <p>Booking details includes of Room:<b>${roomType}</b> , <b>${noOfRooms}</b> , 
               <b>${nightsNumber}</b>, <b>${checkIn}</b>, <b>${checkOut}</b>, <b>${guestCount}</b> </p>

               <p>Booking details includes of your Personal details:<b>${firstName}</b> , <b>${lastName}</b> , 
               <b>${phoneNumber}</b>, <b>${gender}</b>, <b>${address}</b> </p>

               <p>Booking details includes of your Booking status:<b>${cancelReservation}</b> , <b>${confirmCheckIn}</b> , 
               <b>${confirmCheckOut}</b>, and Payment<b>${price}</b> </p>

                Check the Terms and Conditions <a href="https://ravebooking.netlify.app/owners"><b>here</b></a> </p>`,
        } 

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
                res.status(200).json({message:"Booking Confirmation Email has been sent"})
              console.log('Email sent: ' + info.response);
            }
          })
          
}

module.exports ={
    sendNewHotelRegistrationEmail, sendNewBookingEmail
}