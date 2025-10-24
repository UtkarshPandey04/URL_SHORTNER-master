import { generateNanoId } from "../utils/helper.js"
import urlSchema from "../models/short_url.model.js"
import { getCustomShortUrl, saveShortUrl } from "../dao/short_url.js"
import QRCode from "qrcode"

export const createShortUrlWithoutUser = async (url) => {
    let shortUrl = generateNanoId()
    if(!shortUrl) throw new Error("Short URL not generated")
    let attempts = 0;
    while (attempts < 10) {
        try {
            const qrCode = await QRCode.toDataURL(`${process.env.APP_URL}${shortUrl}`)
            await saveShortUrl(shortUrl,url, null, qrCode)
            return shortUrl
        } catch (err) {
            if (err.message === "Conflict occurred" || err.message === "Short URL already exists") {
                shortUrl = generateNanoId();
                attempts++;
            } else {
                throw err;
            }
        }
    }
    throw new Error("Failed to generate unique short URL after 10 attempts")
}

export const createShortUrlWithUser = async (url,userId,slug=null) => {
    // Check if the user has already shortened this URL
    const existingUrl = await urlSchema.findOne({ full_url: url, user: userId });
    if (existingUrl) {
        return existingUrl.short_url;
    }

    let shortUrl;
    if (slug) {
        const exists = await getCustomShortUrl(slug);
        if (exists) throw new Error("This custom url already exists");
        shortUrl = slug;
        const qrCode = await QRCode.toDataURL(`${process.env.APP_URL}${shortUrl}`)
        await saveShortUrl(shortUrl,url,userId, qrCode)
        return shortUrl
    } else {
        shortUrl = generateNanoId();
        let attempts = 0;
        while (attempts < 10) {
            try {
                const qrCode = await QRCode.toDataURL(`${process.env.APP_URL}${shortUrl}`)
                await saveShortUrl(shortUrl,url,userId, qrCode)
                return shortUrl
            } catch (err) {
                if (err.message === "Conflict occurred" || err.message === "Short URL already exists") {
                    shortUrl = generateNanoId();
                    attempts++;
                } else {
                    throw err;
                }
            }
        }
        throw new Error("Failed to generate unique short URL after 10 attempts")
    }
}
