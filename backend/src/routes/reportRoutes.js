const express = require("express");
const { getMonthly, getCategories } = require("../controllers/reportController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/monthly", getMonthly);
router.get("/categories", getCategories);

module.exports = router;