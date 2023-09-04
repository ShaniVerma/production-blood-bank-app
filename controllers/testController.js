 const testController=(req,res)=>{
    res.status(200).send({
        message:'test ruser',
        success:true,
    });
};

module.exports={testController};