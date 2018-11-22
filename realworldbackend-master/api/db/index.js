const { db } = require('./dbconfig')
const sequelize = require('sequelize')

/*Extract all functions defination from the models */
const articleTableCreate = require('./model/article')
const usersTableCreate = require('./model/users')
const tagsTableCreate = require('./model/tags')
const commentTableCreate=require('./model/comment')

/*creating table */
const Article = articleTableCreate(db)
const User = usersTableCreate(db)
const Tag = tagsTableCreate(db)
const Comment = commentTableCreate(db)



/*defeing all the realtion among the models */
User.hasMany(Article)
User.hasMany(Comment)
Article.belongsTo(User)
Article.hasMany(Comment)
Comment.belongsTo(Article)
Comment.belongsTo(User)
//Article.hasMany(Tag)
//Tag.belongsToMany(Article)


/*-------------------------------------------- */

module.exports = { Article,User,Tag,Comment}