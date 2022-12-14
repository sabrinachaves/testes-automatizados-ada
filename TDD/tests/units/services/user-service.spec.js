const User = require("../../../src/models/User");
const UserService = require("../../../src/services/user-service");

class UserMock {
  static async findOne({ email }) {
    const users = {
      "esdras@lets.com.br": {
        _id: "63815037f041b254122338c3",
        name: "Esdras Aguilar",
        email: "esdras@lets.com",
        password: "123456",
      },
    };

    if (users[email]) {
      return users[email];
    }

    return null;
  }
}

describe('User Service "userExists"', () => {
  it("Should return true if user exists", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(UserMock.findOne);

    const userExists = await UserService.userExists("esdras@lets.com.br");

    expect(userExists).toBe(true);
  });

  it("Should return false if user not found", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(UserMock.findOne);

    const userExists = await UserService.userExists(
      "esdras.nao.existente@lets.com.br"
    );

    expect(userExists).toBe(false);
  });

  it("Should capture if User model throws", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(() => {
      throw new Error("User model fails");
    });

    try {
      await UserService.userExists("esdras.nao.existente@lets.com.br");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('User Service "checkPassword"', () => {
  it("Should returns false if password does not match", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(UserMock.findOne);

    const isValidPassword = await UserService.checkPassword(
      "esdras@lets.com.br",
      "123455"
    );

    expect(isValidPassword).toBe(false);
  });

  it("Should returns false user not found", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(UserMock.findOne);

    const isValidPassword = await UserService.checkPassword(
      "invalid@lets.com.br",
      "123456"
    );

    expect(isValidPassword).toBe(false);
  });

  it("Should returns true if password is valid", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(UserMock.findOne);

    const isValidPassword = await UserService.checkPassword(
      "esdras@lets.com.br",
      "123456"
    );

    expect(isValidPassword).toBe(true);
  });
});

describe('User Service "create"', () => {
  //it('Should return false if user exist', )

  it("Should return true if create an user", async () => {
    jest.spyOn(UserService, "userExists").mockImplementationOnce(() => false);

    jest.spyOn(User, "create").mockImplementationOnce(() => {
      return {
        name: "alguem",
        email: "abc@abc.com",
        password: "triste",
        _id: "638ea57734bac791a9286581",
        __v: 0,
      };
    });

    const isCreateTrue = await UserService.create({ email: "abc@abc.com.br" });

    expect(isCreateTrue).toMatchObject({
      name: "alguem",
      email: "abc@abc.com",
      password: "triste",
      _id: "638ea57734bac791a9286581",
      __v: 0,
    });
  });

  it("Should return false if create an user", async () => {
    jest.spyOn(UserService, "userExists").mockImplementationOnce(() => true);

    try {
      await UserService.create({ email: "abc@abc.com.br" });
    } catch (error) {
      expect(error).toMatchObject({
        status: 404,
        message: "User Already exists",
      });
    }
  });
});

describe("User service 'updatePassword'", () => {
  it("Should return a 'ok' message if it is a valid password", async () => {
    jest.spyOn(UserService, "userExists").mockImplementationOnce(() => true);
    jest.spyOn(User, "updateOne").mockImplementation(() => {
      return {
        message: "ok",
      };
    });

    const passwordChangedIsTrue = await UserService.updatePassword(
      "name@email.com",
      "teste1234",
      "teste1234"
    );

    expect(passwordChangedIsTrue).toMatchObject({
      message: "ok",
    });
  });

  it("Should return an error message if it is an invalid password", async () => {
    jest.spyOn(UserService, "userExists").mockImplementationOnce(() => true);

    try {
    await UserService.updatePassword(
            "name@email.com",
            "teste12345",
            "teste123456"
          );
    } catch (error) {
        expect(error).toMatchObject({
            status: 400,
            message: "Password does not match",
    })
    }
  });

  it("Should return an error message if user does not exist", async () => {
    jest.spyOn(UserService, "userExists").mockImplementationOnce(() => false);

      try {
        await UserService.updatePassword(
                "name@email.com",
                "teste12345",
                "teste12345"
              );
        } catch (error) {
            expect(error).toMatchObject({
                status: 404, 
                message: 'User Not Found' ,
        })
        }
  });
});
