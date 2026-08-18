const express = require("express");
const multer = require("multer");

const {
  checkJotformConnection,
  handleJotformWebhook,
} = require("../controllers/jotform.controller");

const router = express.Router();
const upload = multer();

router.get("/jotform/test", checkJotformConnection);

router.post("/webhook/jotform", upload.none(), handleJotformWebhook);

module.exports = router;
