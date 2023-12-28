const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");

require('dotenv').config();

// Access your API key as an environment variable (see "Set up your API key" above)

const genAI = new GoogleGenerativeAI(process.env.API_KEY);



const app = express().use(body_parser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

app.listen(8080, () => {
    console.log("GeminiPro file is Running");
});

app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let hubchallenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];


    if (mode && token) {

        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(hubchallenge);
        } else {
            res.status(403);
        }

    }

});

app.post("/webhook", (req, res) => {

    let body_param = req.body;

    // console.log(JSON.stringify(body_param, null, 2));

    if (body_param.object) {
        if (body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]
        ) {
            let ph_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;
            let thecontent = body_param.entry[0].changes[0].value.messages[0].text.body;
            run(thecontent, from, ph_id);

   
            console.log("Mobile Number-: " + from);
            console.log("Question/Text asked -: " + thecontent);



            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }

    }

});

app.get("/", (req, res) => {
    res.status(200).send("Gemini Pro File is Working");
});

async function run(thecontent, from, ph_id) {

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = thecontent

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini's Reply-:  "+text);

    try {
        const url = 'https://graph.facebook.com/v17.0/' + ph_id + '/messages?access_token=' + token;

        const data = {
            messaging_product: "whatsapp",
            to: from,
            text: {
                body: text
            }
        };
        const headers = {
            "Content-Type": "application/json"
        };

        axios.post(url, data, { headers: headers });


    } catch (error) {
        console.error(error);
    }

}

