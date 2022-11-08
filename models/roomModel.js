import mongoose from "mongoose";
const RoomSchema = new mongoose.Schema({
    roomType:{
        type: String,
        required: true,
    },
    smokingPolicy:{
        type: String,
        required: true,
    },
    numberOfRooms:{
        type: Number,
        required: true,
    },
    bedOptions: {
        bedKinds:{type: String},
        bedNo:{type: Number},
        guestMax:{type: Number},
        roomSize:{ type: Number },
    },
    price:{
        type: Number,
        required: true,
    },
    roomNumbers: [{ number: Number, unavailableDates: {type: [Date]}}],

    },
    {timestamps:true}
)

// export default  mongoose.model("Room", RoomSchema)

export default mongoose.models.Room || mongoose.model('Room', RoomSchema);