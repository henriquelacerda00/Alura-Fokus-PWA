const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const VAPID_PUBLIC_KEY =
  "BJh7FetkyGpADhoXbt85LKhnLNlYp_VOYtdZ9tT-cUm1k8cKb7yPdwm0YJuFP6EZlCvFz9XPKlAL5czs7eukpaQ";

const VAPID_PRIVATE_KEY = "Tp8tbBA5q0QdffOerXLR76pkyOLzL7_nJs2yVQ3GDBI";

webpush.setVapidDetails(
  "mailto: henriquepineli.ti@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

let subscriptions = []
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription) 

  res.status(201).json({})
});

app.post('/send-notification', async (req, res) => {
    const { title, body } = req.body;

    console.log('📨 Recebido pedido de notificação:', { title, body });
    console.log('📋 Subscrições registradas:', subscriptions);

    const notifications = subscriptions.map(subscription => {
        return webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    });

    try {
        await Promise.all(notifications);
        res.status(200).json({ message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('❌ Erro ao enviar notificações:', error);
        res.status(500).json({ error: 'Failed to send notifications' });
    }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});