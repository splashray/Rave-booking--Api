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


    //send verification email
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
                    Check the Terms and Conditions <a href="https://awuf-booking.netlify.app/owners"><b>here</b></a> </p>`,
            } 

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                    res.status(200).json({message:"Confirmation Email has been sent"})
                  console.log('Email sent: ' + info.response);
                }
              })
              
    }

module.exports ={
    sendNewHotelRegistrationEmail
}