

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const _ = require('lodash');



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


require('dotenv').config({path : 'vars/.env'});
const MONGODB_URL = process.env.MONGODB_URL



mongoose.set("strictQuery", true);
mongoose.connect(MONGODB_URL, () => {
  console.log("Connected to MongoDB & mongoose");
});



const itemSchema = {
  name: {
      type:String,
    }
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name:"welcome to your todolist!"
});

const item2 = new Item ({
  name:"Hit the + button to add new item"
});

const item3 = new Item ({
  name:"<-- Hit this to delet an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
   name: String,
   items: [itemSchema]
};


const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

Item.find({},function(err, foundItems){


if (foundItems.length === 0){

  Item.insertMany(defaultItems, function(err){
  if(err) {
    console.log(err);
  }else{
    console.log("successfully saved all the DB");
     }
  });
  res.redirect("/");
}else {

  res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });


  if (listName === "Today"){

    item.save();
      res.redirect("/");
  }else{

    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)

    })
  }



});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findOneAndRemove({_id : checkedItemId}, function (err) {
        if (!err) {
          console.log("Success");
          res.redirect("/");
        }else{
                console.log("Work done successfully!");
                res.redirect("/");
            }
      });

    }else{
          List.findOne({name:listName}, function(err, foundList){
              foundList.items.pull({ _id: checkedItemId });
              foundList.save(function(){

                  res.redirect("/" + listName);
              });
            });
      }
  });



app.get('/:customListName', function(req, res) {

  const customListName = _.capitalize(req.params.customListName);


  List.findOne({name: customListName }, function (err, foundList) {
  if (!err){
    if(!foundList)  {

                const list = new List ({
            name : customListName,
            items: defaultItems
          });

    list.save();
    res.redirect("/" + customListName);
    }else{
  
      res.render("list",  {listTitle:foundList.name, newListItems: foundList.items})
  }
}
  });

 });



app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
