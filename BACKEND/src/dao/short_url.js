import urlSchema from "../models/short_url.model.js";
import { ConflictError } from "../utils/errorHandler.js";

export const saveShortUrl = async (shortUrl, longUrl, userId, qrCode) => {
    try{
        const newUrl = new urlSchema({
            full_url:longUrl,
            short_url:shortUrl,
            qr_code: qrCode
        })
        if(userId){
            newUrl.user = userId
        }
        await newUrl.save()
    }catch(err){
        if(err.code == 11000){
            throw new ConflictError("Short URL already exists")
        }
        throw new Error(err)
    }
};

export const getShortUrl = async (shortUrl) => {
    return await urlSchema.findOneAndUpdate({short_url:shortUrl},{$inc:{clicks:1}});
}

export const getCustomShortUrl = async (slug) => {
    return await urlSchema.findOne({short_url:slug});
}

export const updateStatus = async (id, status) => {
    return await urlSchema.findByIdAndUpdate(id, { status }, { new: true });
}

export const deleteUrl = async (id) => {
    return await urlSchema.findByIdAndDelete(id);
}

export const updateExpiry = async (id, expiryDate) => {
    return await urlSchema.findByIdAndUpdate(id, { expiry_date: expiryDate }, { new: true });
}
