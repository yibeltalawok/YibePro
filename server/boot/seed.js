/* eslint-disable*/
const apiPermissions = require("../seed-data/api-permissions.json");
const seedRoles = async server => {
  const roles = [
    {
      name: "admin",
      description: "Admin"
    },
    {
      name: "owner",
      description: "Owner"
    },
    {
      name: "employee",
      description: "employee"
    }
  ];
  const { UserRole } = server.models;

  return Promise.all(
    //pending=>initial state, neither fullfiled nor rejected
    //fullfilled
    //rejected
    roles.map(role =>
      UserRole.findOrCreate(
        {
          where: {
            name: role.name
          }
        },
        role
      )
    )
  );
};

const seedAdminUsers = async server => {
  const users = [
    {
      fullName: "opms admin",
      email: "admin@pms.com",
      phoneNo: "+251915981847",
      password: "Admin123"
    }
  ];
  const { UserAccount, UserRole } = server.models;

  const adminRole = await UserRole.findOne({
    where: {
      name: "admin"
    }
  });

  if (!adminRole) {
    throw new Error("Unable to find admin role");
  }

  return Promise.all(
    users.map(user => {
      user.userRoleId = adminRole.id;
      return UserAccount.findOrCreate(
        {
          where: {
            email: user.email
          }
        },
        user
      );
    })
  );
};

const seedAPIPermissions = async server => {
  const roles = {
    Administrator: null
  };
  const permissions = apiPermissions;

  const { APIPermission, UserRole } = server.models;

  for (const role in roles) {
    if ({}.hasOwnProperty.call(roles, role)) {
      const userRole = await // eslint-disable-line no-await-in-loop
        UserRole.findOne({
          where: {
            name: role
          }
        });
      roles[role] = userRole && userRole.id ? userRole.id : null;
    }
  }
  return Promise.all(
    permissions.map(async permission => {
      if (permission && roles[permission.roleName]) {
        permission.userRoleId = roles[permission.roleName];
        delete permission.roleName;
        return APIPermission.findOrCreate(
          {
            where: {
              model: permission.model,
              method: permission.method,
              userRoleId: permission.userRoleId
            }
          },
          permission
        );
      }
      return true;
    })
  );
};

module.exports = async server => {
  try {
    await seedRoles(server);
    await seedAdminUsers(server);
    await seedAPIPermissions(server);
  } catch (error) {
    console.log("Seed Error", error); // eslint-disable-line no-console
  }
};
