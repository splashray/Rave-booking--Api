// const mongoose = require('mongoose');
// const Review = require('../models/reviewModel');

// describe('Review model', () => {
//   beforeAll(async () => {
//     mongoose.connect('mongodb://localhost/testdb', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//   });

//   afterAll(async () => {
//     await mongoose.connection.dropDatabase();
//     await mongoose.connection.close();
//   });

//   afterEach(async () => {
//     await Review.deleteMany();
//   });

//   it('should save a review to the database', async () => {
//     const review = new Review({
//       bookingid: '1234',
//       hotelId: '5678',
//       userId: 'abcd',
//       fullName: 'John Doe',
//       location: 'New York',
//       reviewTitle: 'Great hotel',
//       reviewcontent: 'I had a great stay at this hotel.',
//       starRating: 5,
//     });
//     await review.save();

//     const savedReview = await Review.findOne({ bookingid: '1234' });

//     expect(savedReview).toBeDefined();
//     expect(savedReview.bookingid).toBe(review.bookingid);
//     expect(savedReview.hotelId).toBe(review.hotelId);
//     expect(savedReview.userId).toBe(review.userId);
//     expect(savedReview.fullName).toBe(review.fullName);
//     expect(savedReview.location).toBe(review.location);
//     expect(savedReview.reviewTitle).toBe(review.reviewTitle);
//     expect(savedReview.reviewcontent).toBe(review.reviewcontent);
//     expect(savedReview.starRating).toBe(review.starRating);
//   });

//   it('should not save a review without a booking id', async () => {

//     const review = new Review({
//       hotelId: '5678',
//       userId: 'abcd',
//       fullName: 'John Doe',
//       location: 'New York',
//       reviewTitle: 'Great hotel',
//       reviewcontent: 'I had a great stay at this hotel.',
//       starRating: 5,
//     });
//     let error;
//         try{
//             const savedReview = await review.save();
//         } catch (err) {
//             error = err;
//         }

//     expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
//     expect(error.errors.bookingid).toBeDefined();

//   });
// });












// const request = require('supertest');
// const app = require('../index');
// const mongoose = require('mongoose');
// const Review = require('../models/reviewModel');
// const Booking = require('../models/bookingModel');

// describe('Review endpoints', () => {
//   let booking;
//   let review;

// //   beforeAll(async () => {
// //     // Connect to test database
// //      mongoose.connect('mongodb://localhost/testdb', {
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //     });
// //   });

//   afterAll(async () => {
//     // Disconnect from test database
//     await mongoose.connection.close();
//   });

//   beforeEach(async () => {
//     // Create a booking to use in tests
//     booking = new Booking({
//       userId: '641276c7e57fddc8204891a1',
//       bookingRecords: [{
//         bookingId: 'book123', 
//         price: 240,
//         commission :40,
//         email: 'ola@gmail.com',
//         paymentStatus: false,
//         paymentType: 'onsite',
//         hotelDetails: {
//             hotelId: '64331d1e114dded8986838ab',
//             hotelEmail: 'hotel.email',
//             hotelName: 'hotel.hotelBasicInfo.hotelName',
//             hotelAddress: 'hotel.hotelBasicInfo.streetAddress'
//         },
//         userDetails: {
//             firstName: 'firstName',
//             lastName: 'lastName',
//             phoneNumber: 'phoneNumber',
//             title: 'Mr',
//             address: 'address'
//         },
//         roomDetails: {
//             noOfRooms: 2,
//             nightsNumber: 3,
//             checkIn: 14-2-2023,
//             checkOut: 16-2-2023,
//             guestCount: [
//                 {"picked": "Adults", "amount": 2},
                
//                 { "picked": "Children","amount": 5}
//             ],
//             oneRoom:  [
//                 { "roomType":"Single Arena Room", "singlePrice": 1000},

//                 { "roomType":"Double Arena Room","singlePrice": 2500 },
//             ]
//         }
//     }]

//     });
    
//     await booking.save();

//     // Create a review to use in tests
//     review = new Review({
//       bookingid: booking._id,
//       hotelId: '64331d1e114dded8986838ab',
//       userId: '641276c7e57fddc8204891a1',
//       fullName: 'John Doe',
//       location: 'New York',
//       reviewTitle: 'Great hotel!',
//       reviewContent: 'I had a fantastic stay at this hotel.',
//       starRating: 5,
//     });
//     await review.save();
//   });

//   afterEach(async () => {
//     // Delete all bookings and reviews after each test
//     await Booking.deleteMany();
//     await Review.deleteMany();
//   });

//   describe('POST /booking/:bookingid/review', () => {
//     test('creates a new review for a booking', async () => {
//       const res = await request(app)
//         .post(`/booking/${booking._id}/review`)
//         .send({
//           fullName: 'Jane Doe',
//           location: 'Los Angeles',
//           reviewTitle: 'Terrible hotel!',
//           reviewContent: 'I would never stay at this hotel again.',
//           starRating: 1,
//         });

//       expect(res.status).toBe(201);
//       expect(res.body.message).toBe('Thanks for your honest review of the reservation.');
//       expect(res.body.review).toHaveProperty('_id');
//       expect(res.body.review).toHaveProperty('bookingid', booking._id.toString());
//       expect(res.body.review).toHaveProperty('hotelId', 'hotel1');
//       expect(res.body.review).toHaveProperty('userId', 'user1');
//       expect(res.body.review).toHaveProperty('fullName', 'Jane Doe');
//       expect(res.body.review).toHaveProperty('location', 'Los Angeles');
//       expect(res.body.review).toHaveProperty('reviewTitle', 'Terrible hotel!');
//       expect(res.body.review).toHaveProperty('reviewContent', 'I would never stay at this hotel again.');
//       expect(res.body.review).toHaveProperty('starRating', 1);
//     });

//     test('returns an error if booking id is missing', async () => {
//       const res = await request(app)
//         .post('/booking//review')
//         .send({
//           fullName: 'Jane Doe',
//           location: 'Los Angeles',
//           reviewTitle: 'Terrible hotel!',
//           reviewContent: 'I would never stay at this hotel again.',
//           starRating: 1,
//         });

//       expect(res.status).toBe(400);
//       expect(res.body).toHaveProperty('error', 'Booking Id required!');
//     });

//     test('returns an error if booking id is invalid', async () => {
//       const res = await request(app)
//         .post('/booking/invalid/review')
//         .send({
//           fullName: 'Jane Doe',
//           location: 'Los Angeles',
//           reviewTitle: 'Terrible hotel!',
//           reviewContent: 'I would never recommend this hotel to anyone. The room was dirty and the staff was rude.',
//           rating: 1
//         });
//           expect(res.statusCode).toEqual(400);
//           expect(res.body).toHaveProperty('error');
//           expect(res.body.error).toEqual('Invalid booking id');

//     });
//   })

// })
