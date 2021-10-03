var express = require("express");
var router = express.Router();

router.post("/userPermission", function (req, res) {
    const userPermission = {
        mimePermission: [
            {
                mime: "image/jpg",
                size: 100000,
            },
            {
                mime: "image/jpeg",
                size: 100000,
            },
            {
                mime: "text/plain",
                size: 100000,
            },
        ],
        uploadPermission: true,
        createFolder: true,
        totalSize: 100000,
        usedSize: 10000,
    }
 res.json(userPermission);
});

 module.exports = router;
