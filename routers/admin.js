const express = require("express");
const { getAccessToRoute, getAdminAccess } = require("../middlewares/authorization/auth")



//Block User
const { checkUserExist } = require("../middlewares/database/databaseErrorHelpers");
const { blockUser, deleteUser } = require("../controllers/admin");

//Delete User
const router = express.Router();
router.use([getAccessToRoute, getAdminAccess])

router.get("/block/:id", checkUserExist, blockUser);
router.delete("/user/:id", checkUserExist, deleteUser)



module.exports = router;