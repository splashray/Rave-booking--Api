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

/////////// Hotel verifications email  /////////////
    // send hotel new listing email
const sendNewHotelRegistrationEmail = ({hotelCustomId,category,hotelBasicInfo, email}, res) => {
        const { hotelName,contactName } = hotelBasicInfo
            //mail options
            const mailOptions = {
            from: config.AUTH_EMAIL,
            to: `${email}`,
            subject: `Confirmation- ${hotelCustomId}: Application for New ${category} Listing with Rave-booking`,
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
                  res.status(500).json({ message: "Email not sent." });
                } else {
                    res.status(201).json({newHotel: {hotelCustomId,category,hotelBasicInfo, email}, message:"New Property Confirmation Email has been sent"})
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
            res.status(500).json({ message: "Email not sent ." });
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
          reason : `Less expected property information submitted.`
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
/////////// Hotel verification email ends/////////////



/////////// Hotel KYC email  /////////////
   //send hotel's new KYC email
const sendNewHotelKycEmail = ({hotelCustomId,category,hotelBasicInfo, email}, res) => {
  const { hotelName,contactName, } = hotelBasicInfo
      //mail options 
      const mailOptions = {
      from: config.AUTH_EMAIL,
      to: `${email}`,
      subject: `Property ${category} Listed with Rave-booking Kyc details has been received`,
      template: 'newKyc',
      context: {
        Hotel_Name: `${hotelName}`,
        Hotel_Registration_Number : `${hotelCustomId}`,
        contactName : `${contactName}`
      }
      } 

      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            res.status(500).json({ message: "Email not sent ." });
          } else {
              // res.status(200).json({message:"The property has been Verified successfully, Email has been sent!"})
            console.log('Email sent: ' + info.response);
          }
        })
        
}  

  //send hotel's new KYC Verified email
const sendHotelKycVerfiedEmail = ({hotelCustomId,hotelBasicInfo, email},verification_message, res) => {
  const { hotelName,contactName, } = hotelBasicInfo
      //mail options 
      const mailOptions = {
      from: config.AUTH_EMAIL,
      to: `${email}`,
      subject: `${hotelName}'s KYC has been Verified`,
      template: 'kycVerified',
      context: {
        Hotel_Name: `${hotelName}`,
        Hotel_Registration_Number : `${hotelCustomId}`,
        contactName : `${contactName}`,
        verification_message
      }

      } 

      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            res.status(500).json({ message: "Email not sent ." });
          } else {
              // res.status(200).json({message:"The property has been Verified successfully, Email has been sent!"})
            console.log('Email sent: ' + info.response);
          }
        })
        
}  

  //send hotel's new KYC failed email
  const sendHotelKycFailedEmail = ({hotelCustomId,hotelBasicInfo, email},verification_message, res) => {
    const { hotelName,contactName, } = hotelBasicInfo
        //mail options 
        const mailOptions = {
        from: config.AUTH_EMAIL,
        to: `${email}`,
        subject: `${hotelName}'s KYC failed 😣`,
        template: 'kycFailed',
        context: {
          Hotel_Name: `${hotelName}`,
          Hotel_Registration_Number : `${hotelCustomId}`,
          contactName : `${contactName}`,
          verification_message
        }
  
        } 
  
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              res.status(500).json({ message: "Email not sent ." });
            } else {
                // res.status(200).json({message:"The property has been Verified successfully, Email has been sent!"})
              console.log('Email sent: ' + info.response);
            }
          })
          
  }  
/////////// Hotel KYC email  ends/////////////



/////////// Booking email  /////////////
    //send new booking email to users
const sendNewBookingEmailToUser = ({price, bookingId,email,hotelDetails,roomDetails,userDetails, paymentType }, res) => {
    const {hotelName, hotelAddress ,hotelEmail} = hotelDetails

    const { noOfRooms, nightsNumber, checkIn, checkOut, guestCount, oneRoom} = roomDetails

    const { firstName, lastName, phoneNumber, title, address} = userDetails 
    
        //mail options
        const mailOptions = {
        from: config.AUTH_EMAIL,
        to: `${email}`,
        subject: `You have made a booking at ${hotelName}`,
        template: 'newBooking',
        context: {
          hotelName,hotelAddress, hotelEmail, paymentType,

          firstName, lastName, phoneNumber, title, address,

          noOfRooms, nightsNumber,guestCount,price, bookingId,
          // checkOut:checkOut.toLocaleDateString('en-GB'),

          checkOut:checkOut,
          // checkIn: checkIn.toLocaleDateString('en-GB'),
          checkIn: checkIn,

          oneRoom: oneRoom.map(room => ({
            roomType: room.roomType,
            singlePrice: room.singlePrice
          })),
          guestCount: guestCount.map(guest => ({
            picked: guest.picked,
            amount: guest.amount
          })),
        },
        } 

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          })
          
}

   //send new booking email to owners
   const sendNewBookingEmailToOwner = ({price, bookingId,hotelDetails,commission,userDetails }, res) => {
    const {hotelName, hotelEmail} = hotelDetails
    const { firstName, lastName }= userDetails 
    
        //mail options
        const mailOptions = {
        from: config.AUTH_EMAIL,
        to: `${hotelEmail}`,
        subject: `${firstName} made a booking at one of your property - ${hotelName}`,
        template: 'newBookingToOwner',
        context: {
          hotelName,firstName, lastName, price, bookingId, commission
       
        },
        } 

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          })
          
}
/////////// Booking email ends /////////////



/////////// Owner Account email  /////////////
// send new owner verification email
const sendOwnerVerificationEmail = ({firstName, lastName, email, newOtp, link}, res) => {
  //mail options
  const mailOptions = {
    from: config.AUTH_EMAIL,
    to: `${email}`,
    subject: `Verification email from Ravebooking`,
    template: 'ownerVerification',
    context: {
      firstName,
      lastName,
      newOtp,
      link
    },
  } 

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject(false)
      } else {
        console.log('Email sent: ' + info.response);
        resolve(true);
      }
    })
  })
            
}

//send new owner verification success email
const sendOwnerVerificationSuccessEmail = ({email, owner}, res ) => {
  const {firstName, lastName} = owner
  //mail options
  const mailOptions = {
    from: config.AUTH_EMAIL,
    to: `${email}`,
    subject: `Account Successfully Verified - RaveBooking`,
    template: 'ownerVerificationSuccess',
    context: {
      firstName, 
      lastName,
    },

  } 

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        resolve(false)
      } else {
        console.log('Email sent: ' + info.response);
        // res.status(200).json({ message: 'Owner verified successfully' });
        resolve(true);

      }
    })
  })
        
}

//send change password email
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
/////////// Owner Account email  ends /////////////

module.exports ={
    sendNewHotelRegistrationEmail,sendNewHotelVerifiedEmail, sendNewHotelFailedEmail,  sendNewHotelKycEmail, 
    sendHotelKycVerfiedEmail, sendHotelKycFailedEmail, sendNewBookingEmailToUser, sendNewBookingEmailToOwner, sendOwnerVerificationEmail,sendOwnerVerificationSuccessEmail, sendChangePasswordEmail 
}
