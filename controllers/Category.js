const Category = require("../models/Category");

//create category
exports.createCategory = async (req, res) => {
  try {
    //fetch data
    const { name } = req.body;
    //validate

    if (!name) {
      return res.json({
        success: false,
        message: "name is required",
      });
    }
    // check if other category with the same name doesn't exist
    const categoryDetails = await Category.findOne({ name: name });

    if (categoryDetails) {
      return res.json({
        success: true,
        message: "category with this name already exists",
      });
    }
    // create category
    const newCategory = await Category.create({ name });

    // send response
    return res.status(200).json({
      success: true,
      message: "new category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.log(error.message);
    return res.staus(500).json({
      sucess: false,
      message: "Unable to create the category, try again later",
    });
  }
};

//get all the books related to a specific category id
exports.getAllBooksOfCatgeoryId = async (req, res) => {
  try {
    //fetch the category id
    const { categoryId } = req.body;

    //validate
    if (!categoryId) {
      return res.json({
        sucess: false,
        message: "category id is required",
      });
    }
    //find the category of this id in db
    //populate the books field of category
    const findCategory = await Category.findOne({ _id: categoryId })
      .populate({
        path: "books",
        populate: { path: "author" },
      })
      .exec();

    //check if the category exists with this id
    if (!findCategory) {
      return res.json({
        sucess: false,
        message: `cannot find the category with id, ${findCategory}`,
      });
    }
    //send response
    return res.status(200).json({
      sucess: true,
      message: `all the books of category id ${categoryId} fetched successfully`,
      data: findCategory,
    });
  } catch (error) {
    return res.staus(500).json({
      sucess: false,
      message: `unable to fetch all the books related to this category id, ${categoryId}`,
    });
  }
};

//get a category details
exports.getCategory = async (req, res) => {
  try {
    //fetch id
    const { categoryId } = req.body;

    //find category with id
    const categoryDetails = await Category.findOne({ _id: categoryId });

    //check if exists
    if (!categoryDetails) {
      return res.json({
        success: false,
        message: `category with this ${categoryId} doesn't exist`,
      });
    }
    //return response
    return res.status(200).json({
      success: true,
      message: "category details fetched successfully",
      data: categoryDetails,
    });
  } catch (error) {
    console.log(error.message);
    return res.staus(500).json({
      sucess: false,
      message: "Unable to get the category details, try again later",
    });
  }
};

//update category
exports.updateCategory = async (req, res) => {
  try {
    //fetch the data and id
    const { name, categoryId } = req.body;

    //validate
    if (!name || !categoryId) {
      return res.json({
        sucess: false,
        message: "All fields are required",
      });
    }

    //update
    const findCategory = await Category.findByIdAndUpdate(
      { _id: categoryId },
      { name: name },
      { new: true }
    );

    if (!findCategory) {
      return res.json({
        sucess: false,
        message: `cannot find category with id this, ${categoryId}`,
      });
    }
    //send response
    return res.status(200).json({
      sucess: true,
      message: "category updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      sucess: false,
      message: "Unable to update the category, try again later",
    });
  }
};

//delete category
exports.deleteCategory = async (req, res) => {
  try {
    //fetch id
    const { categoryId } = req.body;

    //find the category to be deleted
    const category = await Category.findOne({ _id: categoryId });

    //chech if category with the id exists
    if (!category) {
      return res.json({
        sucess: false,
        message: `category not found with this id, ${categoryId}`,
      });
    }
    //delete the category
    const categoryToDlt = await Category.findByIdAndDelete({
      _id: category._id,
    });

    //send response
    return res.status(200).json({
      sucess: true,
      message: "category deleted successfully",
      deletedCategory: categoryToDlt,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      sucess: false,
      message: "Unable to delete the category, try again later",
    });
  }
};
