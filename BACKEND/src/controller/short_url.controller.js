import { getShortUrl, updateStatus, deleteUrl, updateExpiry } from "../dao/short_url.js"
import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/short_url.service.js"
import wrapAsync from "../utils/tryCatchWrapper.js"

export const createShortUrl = wrapAsync(async (req,res)=>{
    const data = req.body
    let shortUrl
    if(req.user){
        shortUrl = await createShortUrlWithUser(data.url,req.user._id,data.slug)
    }else{  
        shortUrl = await createShortUrlWithoutUser(data.url)
    }
    res.status(200).json({shortUrl : process.env.APP_URL + shortUrl})
})


export const redirectFromShortUrl = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const url = await getShortUrl(id)
    if(!url) throw new Error("Short URL not found")
    if(!url.status) throw new Error("URL is disabled")
    if(url.expiry_date && new Date() > url.expiry_date) throw new Error("URL has expired")
    res.redirect(url.full_url)
})

export const createCustomShortUrl = wrapAsync(async (req,res)=>{
    const {url,slug} = req.body
    const shortUrl = await createShortUrlWithoutUser(url,slug)
    res.status(200).json({shortUrl : process.env.APP_URL + shortUrl})
})

export const toggleStatus = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const url = await updateStatus(id, req.body.status)
    if(!url) throw new Error("URL not found")
    res.status(200).json({message: "Status updated successfully", url})
})

export const deleteUrlController = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const url = await deleteUrl(id)
    if(!url) throw new Error("URL not found")
    res.status(200).json({message: "URL deleted successfully"})
})

export const updateExpiryController = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const {expiry_date} = req.body
    const url = await updateExpiry(id, expiry_date)
    if(!url) throw new Error("URL not found")
    res.status(200).json({message: "Expiry updated successfully", url})
})
