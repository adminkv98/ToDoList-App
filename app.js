//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const uri ="mongodb+srv://admin-adarsh:Adarsh@1998@cluster0-o6mte.mongodb.net/todolistDB";

mongoose.connect(
    uri,
    {
        useNewUrlParser:true,
        useCreateIndex:true,
        useUnifiedTopology: true,
        useFindAndModify:false
    }
);

const itemsSchema = {
  name  : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to ur to do list"
});

const item2 = new Item({
  name : "hit the (+) to add a new item"
});

const item3 = new Item({
  name : "<-- hit this button to delete an item"
});

const defaultsItems = [item1, item2, item3];

const listSchema = {
  name :String,
  items : [itemsSchema]
};


const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

   Item.find({},function(err, foundItems){

   if(foundItems.length===0){
     Item.insertMany(defaultsItems, function(err){
       if(err){
         console.log(err);
       }else{
         console.log("successfully inserted all the items inside the database");
       }
     });
     res.redirect("/");
   }else{
        res.render("list", {listTitle:"Today", newListItems: foundItems});   //list is the name of that file file where we r rendering the data i.e list.ejs
   }



   });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;    //here list value is name of the submit button in which the user is trying to add an item too

 const item = new Item({
    name: itemName
  });

  if( listName === "Today"){
    item.save();
    res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundList){      //foundList == listname
    foundList.items.push(item);
    foundList.save();                                        //items is the embedded array of items in the itemsSchema  and push new item that we created in this function only.. look 5 lines above
    res.redirect("/"+ listName);
  });
}

});

app.post("/delete",function(req,res){
const checkItemId = req.body.checkbox;
const listName = req.body.listName;    //listname comes from the checkbox of list.ejs

if(listName==="Today"){
  Item.findByIdAndRemove(checkItemId,function(err){
    if(err){
      console.log(err);
    }else{
      console.log("successfully deleted");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items : {_id : checkItemId}}},function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}

});

app.get("/:custumLink", function(req,res){

  const custumLink = _.capitalize( req.params.custumLink);   //lodash will convert all the format into 1st letter in capital and rest in small.

  List.findOne({name : custumLink}, function(err,foundList){  //findList is an object which is returned.   foundList == custumLink  , findOne only return a single object.
    if(!err){  // if there is no error
      if(!foundList){  //is list with same list is not there.
        const list = new List ({
          name : custumLink,
          items: defaultsItems
        });
            list.save();
            res.redirect("/"+ custumLink);

      }else{
        res.render("list",{listTitle : foundList.name, newListItems: foundList.items});
        //show an existing a list
      }
    }


  });



});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
