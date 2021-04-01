"use strict";

module.exports = function (Contactus) {
  Contactus.afterRemote("create", function (ctx, user, next) {
    const { Email } = Contactus.app.models;
    let msg = ctx.req.body.message;
    let from = ctx.req.body.email;
    let to = [
      "sciemesfin55@gmail.com",
      "teferatilaye@gmail.com",
      "monikapnghl@gmail.com",
    ];
    let path =
      ctx.req.body.rootPath +
      "/containers" +
      "/attachment" +
      "/download/" +
      ctx.req.body.fileName;
    let atmt = ctx.req.body.rootPath;
    Email.send(
      {
        to: to,
        from: from,
        subject: "Message from -> " + from,
        html: msg,
        attachments:
          atmt != ""
            ? [
              {
                filename: ctx.req.body.fileName,
                path: path,
              },
              {
                raw:
                  "Content-Type: text/plain\r\n" +
                  "Content-Disposition: attachment;\r\n" +
                  "\r\n",
              },
            ]
            : [],
      },

      (err) => {
        console.log("Message sent.");
        if (err) {
          console.log("Unable to sent");
          console.log(err);
        }
      }
    );
  });
};
