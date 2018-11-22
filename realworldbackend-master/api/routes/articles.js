const { Router } = require('express')
const { Op } = require('sequelize')
const { Article,Tag,User,Comment} = require('../db/index')
const route = Router()
const Auth = require('./user/auth')
const  Helper  = require('../../Helper/converter');
/*
*get all aricles data api
   path ---- /api/articles 
*/
route.get('/', async (req, res) => {
    var whereClause = []
    var limit=20,offset=0;
        for (let key of Object.keys(req.query)) {
            switch(key) {
                case 'tag':
                    whereClause.push({
                        tag: {[Op.like]: "%~"+req.query.tag+"~%"}
                    })
                break;
                
                case 'author' :
                const user = await User.findOne({ where: {username: req.query.author }})
                 if(user!==null){
                        whereClause.push({
                        userId:{[Op.eq] : user.id}
                    })
                }
                else
                {
                    whereClause.push({
                        userId:{[Op.eq] : null}
                    })
                }
                break;
                case 'limit':
                    limit=req.query.limit
                break;

                case 'offset':
                    offset=req.query.offset
             }
        }           
    const article = await Article.findAll({
        where:whereClause,
        include:[{ model: User, attributes: ['username','email','bio','image']}],
        limit: limit,
        offset: offset
    })
    for(var i=0;i<article.length;i++){
        article[i].tag  = Helper.parseStringIntoArray(article[i].tag)
    }
      res.status(200).json({articles:article,articleCount:article.length});
    });
/**
 * create article 
 * /api/articles
 * body -articles json
 */
route.post('/',Auth.required,async (req,res)=>{
    const user = await User.findById(req.payload.id)
    if(!user)
    { 
       res.sendStatus(401).json({"errors": {"msg": ["authfailed"]}}); 
    }
    else{
        var slugkey = Helper.slugify(req.body.article.title);
        var tags=[];
        if(req.body.article.hasOwnProperty('tagList')){
             tags = req.body.article.tagList;
        }
        console.log("=========== article persisting start ==========")
        const newArticle = await Article.create({
            slug:slugkey,
            body: req.body.article.body,
            title: req.body.article.title,
            description: req.body.article.description,
            tag:Helper.parseArrayIntoString(tags),
            userId:user.id
        })
        console.log(newArticle);
        console.log("=========== article persisting end ==========")
        console.log("=========== tag persisting start ==========")
        for(var i=0;i<tags.length;i++)
        {
            const tag = await Tag.findOrCreate({
                where: { tagName: tags[i]}, 
                defaults: { tagName: tags[i] }
            })
        }
        console.log("=========== tag persisting end ==========")
    res.status(200).json(newArticle.toJSONFor(user));
    }
})  

/**
 * get article deatils for particular article 
 * GET /api/articles/:slug
 * 
 */
route.get('/:slug', async (req, res) => {
    const article = await Article.findOne({
         where: {slug:req.params.slug },
    })
    const user = await User.findById(article.userId)
    res.status(200).json({article:article.toJSONFor(user)});
})

/**
 * add comments to article
 * :slug/comments
 * 
 */

route.post('/:slug/comments',Auth.required,async (req,res)=>{
    const user = await User.findById(req.payload.id)
    const article = await Article.findOne({
         where: {slug:req.params.slug },
    })
    if(user!==null){
        const comment = await Comment.create({
            comment:req.body.comment.body,
            userId:user.id,
            articleId:article.id
        })
        res.status(200).send({msg:"created"})
    }    
    else
    {
        res.status(400).send({error:{msg:"accessdenied"}})
    }
})    

/**
 * retrive comments to one article
 * :slug/comments
 * 
 */

route.get('/:slug/comments',async (req,res)=>{
    const article = await Article.findOne({
         where: {slug:req.params.slug },
    })
    const comment = await Comment.findAll({
        where: {articleId:article.id},
        include:[{ model: User, attributes: ['username','email','bio','image']}],
    })
   var commentArray=[];
    comment.forEach((singleComment) => {
        commentArray.push(singleComment.toJSONFor(singleComment.user));
    })
    res.status(200).json({comment:commentArray})
})    


/**
 * 
 * delete article
 * /articles/:slug
 */
route.delete('/:slug',Auth.required,async (req,res)=>{
    const user = await User.findById(req.payload.id)

    if(user!==null){
        const article = await Article.findOne({
         where: [{slug:req.params.slug },{userId:user.id}],
        })
    
        if(article!==null){
            const articleDel = await article.destroy()
            res.sendStatus(204)
        }
    else{
        res.sendStatus(403);
    }
}
})

/**
 * 
 * delete comment
 * /api/articles/:slug/comments/:id
 */
route.delete('/:slug/comments/:id',Auth.required,async (req,res)=>{
    const user = await User.findById(req.payload.id)

    if(user!==null){
        const comment = await Comment.findOne({
         where: [{id:req.params.id},{userId:user.id}],
        })
        if(comment!==null){
            const commenteDel = await comment.destroy()
            res.status(200).json({msg:"comment delete"})
        }
    else{
        res.status(401).json({error:{msg:"comment cannot found"}});
    }
}
})


module.exports = route