const prisma = require("../models/prisma")
const createError = require("../utils/create-error")
const { checkPostIdSchema } = require("../validators/post-validator")

exports.toggleLike = async (req,res,next)=>{
    try {
        const {value ,error} = checkPostIdSchema.validate(req.params)
        if(error){
            return next(error)
        }
        const existPost = await prisma.post.findUnique({
            where :{
                id :value.postId
            }
        })
        if(!existPost){
            return next(createError('post does not exist',400))
        }

        const existLike = await prisma.like.findFirst({
            where : {
                userId : req.user.id ,
                postId : value.postId
            }
        })

        if(existLike){
            await prisma.like.delete({
                where : {
                    id :existLike.id
                }
            })
            await prisma.post.update({
                data:{
                    totalLike :{
                        decrement :1
                    }
                },where :{
                    id :value.postId
                }
            })
            return res.status(200).json({ message : 'unlike'})
        }
        await prisma.like.create({
            data :{
                userId :req.user.id,
                postId :value.postId
            }
        })
        await prisma.post.update({
            data :{
                totalLike :{
                    increment : 1
                }
            },where :{
                id : value.postId
            }
        })
        res.status(200).json({ message : 'like'})
    } catch (err) {
        next(err)
    }
}