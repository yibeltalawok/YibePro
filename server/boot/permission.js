module.exports = function(app) {
  const { UserRole } = app.models;
  UserRole.registerResolver("$admin", async (role, context) => {
    if (
      !context.accessToken ||
      !context.accessToken.userInfo ||
      !context.accessToken.userInfo.userRole ||
      context.accessToken.userInfo.userRole.name
      !== "admin"
    ) {
      return false;
    }

    return true;
  });
};
