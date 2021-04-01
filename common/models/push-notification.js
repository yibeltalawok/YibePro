"use strict";

// firebase-admin config
let admin = require("firebase-admin");
let serviceAccount = require("../../server/serviceAccountKey.json");
admin.initializeApp({
  type: "service_account",
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
//firebase-admin config

module.exports = function (Pushnotification) {
  Pushnotification.observe("after save", function (ctx, next) {
    let data = {
      notification: {
        title: ctx.instance.title,
        body: ctx.instance.message,
      },
      data: {
        title: ctx.instance.title,
        message: ctx.instance.message,
        nDate: ctx.instance.nDate.toString(),
      },
    };
    let receiver = ctx.instance.receiver;
    let collection =
      receiver != null
        ? receiver.toLowerCase() == "supervisor"
          ? "Supervisor"
          : receiver.toLowerCase() == "mechanic" ||
            receiver.toLowerCase() == "machine technician"
          ? "Mechanic"
          : "Unspecificed"
        : console.log(
            "Receiver null. Notification cannot be send to unspecified receiver."
          );

    db.collection(collection)
      .add(data)
      .then(() => {
        console.log(
          "Message sent to FCM successfully. Receiver role: " + collection
        );
        console.log(data);
      })
      .catch((err) =>
        console.log("Unable to Send Message to FCM. " + err.toString())
      );

    next();
  });
};
