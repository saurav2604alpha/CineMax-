const express = require("express");
const {
  postConcession,
  putConcession,
  deleteConcession,
  getConcessions,
  changeStock,
} = require("../controllers/concession.controller");

const router = express.Router();

router.post("/concession", postConcession);
router.put("/concession/:id", putConcession);
router.delete("/concession/:id", deleteConcession);
router.get("/concession", getConcessions);
router.put("/concession-stock/:id", changeStock);

module.exports = router;
