import User from "../models/user.model.js"
import UrlModel from "../models/short_url.model.js"
import qrcode from 'qrcode';
import { nanoid } from "nanoid";
export const findUserByEmail = async (email) => {
    return await User.findOne({email})
}

export const findUserByEmailByPassword = async (email) => {
    return await User.findOne({email}).select('+password')
}

export const findUserById = async (id) => {
    return await User.findById(id)
}

export const createUser = async (name, email, password) => {
    const newUser = new User({name, email, password})
    await newUser.save()
    return newUser
}

export const getAllUserUrlsDao = async (id) => {
    return await UrlModel.find({user:id})
}
export const createShortUrlDao = async (fullUrl, shortUrl, userId, expiryDate = null) => {
    // First, check if this user has already shortened this exact URL.
    const alreadyExists = await UrlModel.findOne({ full_url: fullUrl, user: userId });
    if (alreadyExists) {
        // If it exists, return the existing URL object.
        return { ...alreadyExists.toObject(), was_created: false };
    }

    let retries = 5; // Number of retries to prevent infinite loops
    const isCustom = !!shortUrl; // Check if a custom slug was provided
    let finalShortUrl = shortUrl || nanoid(6); // Use custom slug or generate a new one
    let newUrl = null;

    while (retries > 0) {
        const existingUrl = await UrlModel.findOne({ short_url: finalShortUrl });
        if (!existingUrl) {
            // Generate QR code for the short URL
            const shortUrlFullLink = `http://localhost:3000/${finalShortUrl}`;
            let qrCodeDataUrl = null;
            try {
                qrCodeDataUrl = await qrcode.toDataURL(shortUrlFullLink);
            } catch (err) {
                console.error('Error generating QR code:', err);
            }

            newUrl = new UrlModel({
                full_url: fullUrl,
                short_url: finalShortUrl,
                user: userId,
                qr_code: qrCodeDataUrl,
                status: true,
                expiry_date: expiryDate
            });

            await newUrl.save();
            return { ...newUrl.toObject(), was_created: true }; // Success, exit the loop and function
        }

        // If a custom slug was provided and it exists, we should not retry.
        if (isCustom) {
            return null; // Signal that the custom slug already exists
        }

        // If it's a random collision, generate a new one and retry.
        finalShortUrl = nanoid(6);
        retries--;
    }

    // If we've exhausted retries, throw an error.
    throw new Error("Failed to generate a unique short URL after multiple attempts.");
};
