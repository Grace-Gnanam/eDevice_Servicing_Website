const http = require('http');
const fs = require('fs');
const path = require('path'); 

//To include mongoose module in node js program
const mongoose = require('mongoose');
//Connecting to the mongodb database
mongoose.connect('mongodb://localhost:27017/')
.then(function(){
console.log('DB Connected')
})

//Defining the Structure of mongodb document
const UserSchema = new mongoose.Schema({mail:String, pass:String});
//Create collection model 
const Usermodel = mongoose.model('Users',UserSchema);

const server = http.createServer(function(req,res){
    if(req.url === '/'){
        res.writeHead('200',{'Content-Type':'text/html'});
        fs.createReadStream('E-Device_Services/signup.html').pipe(res);
    }
    else if(req.url=== '/signup' && req.method === 'POST'){
        var rawdata = '';
        req.on('data',function(data){
            rawdata += data;
        })
        req.on('end',function(){
        var formdata = new URLSearchParams(rawdata);
        res.writeHead('200',{'Content-Type':'text/html'});
        Usermodel.create({
        mail:formdata.get('mail'),
        pass:formdata.get('pass')
        })
        // res.write('Data Saved Successfully');
        res.end();
        })
    }
});
server.listen('8000',function(){
    console.log('Server started at port http://localhost:8000');
})
   
   