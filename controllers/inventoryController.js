const userModel = require("../models/userModel")
const inventoryModel = require("../models/inventoryModel");
const mongoose  = require("mongoose");


/// CREATE INVENTORY
const createInventoryController=async(req,res)=>{
try {
    const {email}=req.body
    // validation
    const user=await userModel.findOne({email})
    function throwErr(msg){
        throw new Error(msg);
    }
    if(!user){
        
    return throwErr('not a user')
       
    }
    // if(inventoryType==='in' && user.role!=='donar'){
    //       return throwErr('Not a donar')
    // // }
    // if(inventoryType==='out'&& user.role!=='hospital'){
    //      return throwErr('Not a hospital')
    // }
   
    if(req.body.inventoryType==='out'){
       const requestedBloodGroup= req.body.bloodGroup;
       const requestedQuantityOfBlood=req.body.quantity;
       const organisation=new mongoose.Types.ObjectId(req.body.userId)

       //calculatr blood quantity
       const totalInOfRequestedBlood=await inventoryModel.aggregate([
        {
            $match:{
            organisation,
            inventoryType:'in',
            bloodGroup:requestedBloodGroup
            }
        },
        {
            $group:{
                _id:'$bloodGroup',
                total:{$sum:'$quantity'}

            }
        }
       ])
      // console.log('Total In',totalInOfRequestedBlood);
      const totalIn= totalInOfRequestedBlood[0]?.total||0;
       /// total Out blood quantity
       const totalOutOfRequestedBlood=await inventoryModel.aggregate([
        {$match:{
            organisation,
            inventoryType:'out',
            bloodGroup:requestedBloodGroup,

        }},
        {
            $group:{
                _id:'$bloodGroup',
                total:{$sum:'$quantity'}
            }
        }
       ])

       const totalOut= totalOutOfRequestedBlood[0]?.total||0;
      /// In & Out calc;
      const availableQuantityOfBloodGroup=totalIn-totalOut;
      // validation of quantity

      if(availableQuantityOfBloodGroup<requestedQuantityOfBlood){
        return res.status(500).send({
          success:false,
          message:`Only ${availableQuantityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available `

        }
        )
      }
      req.body.hospital=user?._id
    }else{

        req.body.donar=user?._id;
    }


 //save record
      
    const inventory =new inventoryModel(req.body)
    await inventory.save()
    return res.status(201).send({
        success:true,
        message:'new blood record added',
    })
} catch (error) {
    console.log(error)

    return res.status(500).send({
        success:false,
        message:'Error In Create Inventory API',
        error,
    });
}
};

// GET ALL BLOOD RECORDS
const getInventoryController=async(req,res)=>{
try {
    const inventory=await inventoryModel.find({
        organisation:req.body.userId})
        .populate('donar')
        .populate('hospital')
        .sort({createdAt:-1});
    return res.status(200).send({
        success:true,
        message:'get all records successfully',
        inventory,
    });
    
} catch (error) {
    console.log(error)
    return res.status(500).send({
        success:false,
        message:'Error IN Get All Inventory',
        error
    })
}
};



// GET Hospital BLOOD RECORDS
const getInventoryHospitalController=async(req,res)=>{
    try {
        const inventory=await inventoryModel.find(req.body.filters)
            .populate('donar')
            .populate('hospital')
            .populate('organisation')
            .sort({createdAt:-1});
        return res.status(200).send({
            success:true,
            message:'gethospital consumer records successfully',
            inventory,
        });
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:'Error IN Get consumer Inventory',
            error
        })
    }
    };
    
//GET BLOOD RECORD OF 3
const getRecentInventoryController=async(req,res)=>{
try {
    const inventory=await inventoryModel.find({
        organisation:req.body.userId,

    }).limit(3).sort({createdAt:-1})
    return res.status(200).send({
        success:true,
        message:'recent Inventory Data',
        inventory,
    })
} catch (error) {
    console.log(error);
    return res.status(500).send({
        success:false,
        message:'Error in Recent Inventory API ',
        error,
    })
}
}

//GET DONAR RECORDS
const getDonarsController=async(req,res)=>{
 
    try {
        const organisation=req.body.userId;
        //find Donars

        const donarId=await inventoryModel.distinct('donar',{
            organisation,

        });
        //console.log(DonarId)

        const donars=await userModel.find({_id:{$in:donarId}});
        return res.status(200).send({
            success:true,
            message:'Donar Record Fetched Successfully',
            donars,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:'Error in Donar records',
            error
        })
    }
};

const getHospitalController=async(req,res)=>{
 try {
  const organisation=req.body.userId;
  // GET HOSPITAL ID
  
  const hospitalId=await inventoryModel.distinct('hospital',{organisation})
  // FIND HOSPITAL

  const hospitals=await userModel.find({
    _id:{$in:hospitalId}
  })
  return res.status(200).send({
    success:true,
    message:'Hospitals Data Fetched Successfully',
    hospitals
  });
 } catch (error) {
    console.log(error)
    return res.status(500).send({
        success:false,
        message:'Error In Getting Hospital API',
        error
    })
 }
}

//GET ORG PROFILES
const getOrganisationController =async(req,res)=>{
    try {
       const donar =req.body.userId;
       const orgId=await inventoryModel.distinct('organisation',{donar})

       // find org

       const  organisations=await userModel.find({
        _id:{$in:orgId}
       })
       return res.status(200).send({
        success:true,
        message:'Org Data Fetched Successfully',
        organisations
       })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:'Error IN ORG API',
            error
        })
    }
};



//GET ORG  for hospital PROFILES
const getOrganisationForHospitalController =async(req,res)=>{
    try {
       const hospital =req.body.userId;
       const orgId=await inventoryModel.distinct('organisation',{hospital})

       // find org

       const  organisations=await userModel.find({
        _id:{$in:orgId}
       })
       return res.status(200).send({
        success:true,
        message:' Hospital Org Data Fetched Successfully',
        organisations
       })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:'Error IN Hospital ORG API',
            error
        })
    }
};

module.exports={createInventoryController
    ,getInventoryController, 
    getDonarsController,
    getHospitalController
    ,getOrganisationController,
    getOrganisationForHospitalController,
    getInventoryHospitalController,
    getRecentInventoryController};