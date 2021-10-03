var express = require("express");
var router = express.Router();

router.post("/userSetting", function (req, res) {
    const setting = {
        viewMode: "grid",
      }
 res.json(setting);
});

 module.exports = router;
