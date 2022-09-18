const express = require("express")
const app = express()
const port = 3000

const bodyParser = require("body-parser")
const date = require(__dirname+"/date.js")
const mongoose = require("mongoose")
const _ = require("lodash")

app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))


mongoose.connect("mongodb+srv://arnab:am943477@cluster0.fgjz65t.mongodb.net/todolistDB")

const itemSchema = {
    name : String
}

const Item = mongoose.model("Item",itemSchema)

const item1 = new Item({
    name: "Welcome to the ToDoList"
})

const item2 = new Item({
    name: "Press the + button to add items"
})

const item3 = new Item({
    name: "<-- check the chekbox"
})

const itemsList = [item1,item2,item3]

const listSchema = {
    name: String,
    items : [itemSchema]
}

const List = mongoose.model("List",listSchema)


app.get("/",function(req,res){

    const day = date.getDate()

    Item.find({},function(err,items){
        if(err){
            console.log(err);
        }

        if(items.length===0){
            Item.insertMany(itemsList,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Items added successfully")
                }
            })
            res.redirect("/")
        }
        else{
            res.render("list",{listTitle: day, newListItems:items})
        }
    })
})

app.post("/",function(req,res){

    const newItems = req.body.newItem
    const listName = req.body.list

    const item = new Item({
        name: newItems
    })

    if(listName === date.getDate().toString()){
        item.save()
        res.redirect("/")
    }
    else{
        List.findOne({name: listName},function(err,foundList){
            foundList.items.push(item)
            foundList.save()
            res.redirect("/"+listName)
        })
    }
    
})

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox
    const listName = req.body.listName

    if(listName === date.getDate().toString()){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("Deleted")
            }
        })
    
        res.redirect("/")
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items : {_id : checkedItemId}}}, function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("Deleted")
                res.redirect("/"+listName)
            }
        })     
    }
    
})


app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({name:customListName},function(err,foundList){
        if(err){
            console.log(err)
        }
        else{
            if(!foundList){
                // create a new list
                const list = new List({
                    name: customListName,
                    items: itemsList
                })
            
                list.save()
                res.redirect("/"+customListName)
            }
            else{
                // show an existing list
                res.render("list",{listTitle: foundList.name,newListItems:foundList.items})
            }
        }
    })

})



app.listen(port,function(){
    console.log(`Server started on port ${port}`)
})