const express = require('express')
const {
  db
} = require('./api/db/dbconfig')
const cors = require('cors') 
const app = express()

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

var myLogger = function (req, res, next) {
  if(req._consuming ){
    console.log("===================================")
    console.log("resource request for client===== "+req.originalUrl);
    console.log("===================================")
  }
  next()
}

app.use(myLogger)
/* define entry point for every api availabe*/ 
app.use('/api',require('./api/index.js'))
/*-------------------------------------------- */

app.use(cors());
app.use(function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
res.header("Access-Control-Allow-Headers",
"Origin, X-Requested-With, Content-Type, Accept"
);
next();
});  
 db.sync({truncate: true})
  .then(() => {
    console.log('Database synced')
    app.listen(3939, () => {
      console.log('Server started http://localhost:3939')
    })
  })
  .catch(console.error)

  app.get('/',async (req,res)=>{
        res.status(200).json({error:{message:"include api to acess the api content"}})
  })