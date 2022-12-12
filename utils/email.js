const nodemailer = require('nodemailer')
const config = require('./../utils/config')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

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
        console.log("Ready for Message ");
        console.log(success);
    }
})

const handlebarOptions = {
  viewEngine:{
    defaultLayout: false,
    extName: '.handlebars',
    partialsDir: path.resolve(__dirname, '..', 'email-templates')
  },
  viewPath: path.resolve(__dirname, '..', 'email-templates'),
  extName: '.handlebars'
}

transporter.use('compile', hbs(handlebarOptions))

//send hotel new listing email
const sendNewHotelRegistrationEmail = ({hotelCustomId,category,hotelBasicInfo, email}, res) => {
        const { hotelName,contactName } = hotelBasicInfo
            //mail options
            const mailOptions = {
            from: config.AUTH_EMAIL,
            to: `${email}`,
            subject: `Confirmation-${hotelCustomId}: Application for New ${category} Listing with Rave-booking`,
            template: 'hotelCreated',
            context: {
              Hotel_Name: `${hotelName}`,
              Hotel_Registration_Number : `${hotelCustomId}`,
              contactName : `${contactName}`
            }
            } 

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                  res.status(200).json({ message: "Email not sent." });
                } else {
                    res.status(200).json({message:"New Property Confirmation Email has been sent"})
                  console.log('Email sent: ' + info.response);
                }
              })
              
    }

    //send hotel verified  email
const sendNewHotelVerifiedEmail = ({hotelCustomId,category,hotelBasicInfo, email}, res) => {
  const { hotelName,contactName, } = hotelBasicInfo
      //mail options 
      const mailOptions = {
      from: config.AUTH_EMAIL,
      to: `${email}`,
      subject: `Property ${category} Listed with Rave-booking is Verified!`,
      template: 'hotelVerified',
      context: {
        Hotel_Name: `${hotelName}`,
        Hotel_Registration_Number : `${hotelCustomId}`,
        contactName : `${contactName}`
      }
      } 

      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            res.status(200).json({ message: "Email not sent ." });
          } else {
              res.status(200).json({message:"The property has been Verified successfully, Email has been sent!"})
            console.log('Email sent: ' + info.response);
          }
        })
        
}

   //send hotel failed  email
const sendNewHotelFailedEmail = ({hotelCustomId,category,hotelBasicInfo, email}, res) => {
    const { hotelName,contactName, } = hotelBasicInfo
        //mail options 
        const mailOptions = {
        from: config.AUTH_EMAIL,
        to: `${email}`,
        subject: `Property ${category} Listed with Rave-booking has Failed!`,
        template: 'hotelFailed',
        context: {
          Hotel_Name: `${hotelName}`,
          Hotel_Registration_Number : `${hotelCustomId}`,
          contactName : `${contactName}`,
          reason : `Fewer Amenties available at property.`
        }
        } 
  
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              res.status(200).json({ message: "Email not sent ." });
            } else {
                res.status(200).json({message:"The property has been Failed successfully, Email has been sent!"})
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
        subject: `Booking-${bookingId}: You have a  New Booking from Rave-booking`,
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

//send new owner verification email
const sendOwnerVerificationEmail = (ownerDetails, res, verificationUrl) => {
      const {firstName, lastName} = ownerDetails

      //mail options
      const mailOptions = {
        from: config.AUTH_EMAIL,
        to: `${ownerDetails.email}`,
        subject: `Verification email from Ravebooking`,
        template: 'ownerVerification',
        context: {
          verificationUrl,
          firstName,
          lastName
        },
      } 

      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            res.status(200).json({message: "You will receive a verification email shortly"})
          } else {
            res.status(200).json({message:"Verification Email has been sent"})
            console.log('Email sent: ' + info.response);
          }
        })
            
}

//send new owner verification email
const sendChangePasswordEmail = ({email, link}) => {

  //mail options
  const mailOptions = {
    from: config.AUTH_EMAIL,
    to: email,
    subject: `Change password from Ravebooking`,
    template: 'forgotPassword',
    context: {
      email,
      link
    },
  } 

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        resolve(false)
      } else {
        console.log('Email sent: ' + info.response);
        resolve(true)
      }
    })
  })
}

module.exports ={
    sendNewHotelRegistrationEmail, sendNewHotelVerifiedEmail, sendNewHotelFailedEmail, sendNewBookingEmail, sendOwnerVerificationEmail, sendChangePasswordEmail
}