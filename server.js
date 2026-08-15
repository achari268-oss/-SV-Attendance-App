require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "SV Attendance SMS Server is running"
    });
});

app.post("/send-sms", async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                message: "Phone number and message are required"
            });
        }

        const response = await fetch(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                method: "POST",
                headers: {
                    "Authorization": process.env.FAST2SMS_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    route: "q",
                    message: message,
                    numbers: phone,
                    sms_details: "1"
                })
            }
        );

        const data = await response.json();

        console.log("Fast2SMS response:", data);

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                data: data
            });
        }

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("SMS Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`SV Attendance SMS Server running on port ${PORT}`);
});