const bcrypt = require("bcrypt-nodejs");
const {
  error
} = require("../helpers");

module.exports = UserAccount => {
  UserAccount.afterRemote("login", async (ctx, result) => {
    const {
      userInfo
    } = result;
    if (!userInfo) {
      throw error("Internal server error", 500);
    }
    ctx.result = {
      auth_token: result.id,
      fullName: userInfo.fullName,
      email: userInfo.email,
      phoneNo: userInfo.phoneNo,
      role: userInfo.userRole() ?
        userInfo.userRole().name : "",
      id: userInfo.id
    };
  });
  // admin registration
  UserAccount.registerAdmin =
    async (fullName, email, password, phoneNo) => {
      const {
        UserRole
      } = UserAccount.app.models;
      const adminRole = await UserRole.findOne({
        where: {
          name: "admin"
        }
      });

      if (!adminRole) {
        // eslint-disable-next-line
        console.error("unable to find admin role");
        throw new Error("Internal server error try again");
      }
      const user = {
        userRoleId: adminRole.id,
        fullName,
        email,
        password,
        phoneNo
      };
      const createdUser = await UserAccount.create(user);
      return createdUser;
    };
  UserAccount.remoteMethod("registerAdmin", {
    description: "Register user",
    accepts: [{
      arg: "fullName",
      type: "string",
      required: true
    },
    {
      arg: "email",
      type: "string",
      required: true
    },
    {
      arg: "password",
      type: "string",
      required: true
    },
    {
      arg: "phoneNo",
      type: "string",
      required: false
    }
    ],
    returns: {
      type: "object",
      root: true
    },
    http: {
      verb: "post",
      path: "/register-admin"
    }
  });

  //this is a customisez password reset logic.
  // change password 
  UserAccount.updatePassword = async (
    oldPassword,
    newPassword,
    accessToken
  ) => {
    if (!accessToken || !accessToken.userId)
      throw Error("Unauthorized User", 403);

    // find current user
    const user = await UserAccount.findById(accessToken.userId);
    if (!user) throw Error("Unauthorized User", 403);

    // check if old password is correct
    const isMatch = await new Promise(resolve => {
      bcrypt.compare(oldPassword, user.password, (err, match) => {
        resolve(match);
      });
    });

    // if old password is not correct throw Error
    if (!isMatch) throw Error("Invalid current password", 401);

    await user.patchAttributes({
      password: newPassword
    });

    const resp = await UserAccount.login({
      email: user.email,
      password: newPassword
    });

    return {
      tokenId: resp.id
    };
  };
  UserAccount.remoteMethod("updatePassword", {
    description: "Request password change",
    accepts: [{
      arg: "oldPassword",
      type: "string",
      required: true
    },
    {
      arg: "newPassword",
      type: "string",
      required: true
    },
    {
      arg: "tokenId",
      type: "object",
      http: ctx => {
        const req = ctx && ctx.req;
        const accessToken = req && req.accessToken ?
          req.accessToken : null;
        return accessToken;
      }
    }
    ],
    returns: {
      type: "object",
      root: true
    },
    http: {
      verb: "post",
      path: "/update-password"
    }
  });
};