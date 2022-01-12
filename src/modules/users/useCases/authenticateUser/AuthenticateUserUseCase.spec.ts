import jwt from "jsonwebtoken";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { User } from "../../entities/User";
import authConfig from '../../../../config/auth';
import { AppError } from "../../../../shared/errors/AppError";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User Use Case", () => {
  interface ITokenUser {
    user: User,
    token: string,
  }

  const testUSerData: ICreateUserDTO = {
    name: "John Doe",
    email: "john.doe@mail.com",
    password: "password",
  }

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate an user", async () => {
    await createUserUseCase.execute(testUSerData);

    const { user, token } = await authenticateUserUseCase.execute({
      email: testUSerData.email,
      password: testUSerData.password,
    });

    const decodedToken = jwt.verify(token, authConfig.jwt.secret) as ITokenUser;

    expect(user).toHaveProperty("id");
    expect(user).not.toHaveProperty("password");
    expect(user.name).toEqual(testUSerData.name);
    expect(user.email).toEqual(testUSerData.email);
    expect(decodedToken.user).toHaveProperty("id");
    expect(decodedToken.user).toHaveProperty("password");
    expect(decodedToken.user.name).toEqual(testUSerData.name);
    expect(decodedToken.user.email).toEqual(testUSerData.email);
  });

  it("should not be able to authenticate an user that does not exist", async () => {
    await expect(async () => await authenticateUserUseCase.execute({
      email: testUSerData.email,
      password: testUSerData.password,
    })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate an user with incorrect password", async () => {
    await createUserUseCase.execute(testUSerData);

    await expect(async () => await authenticateUserUseCase.execute({
      email: testUSerData.email,
      password: "incorrect password",
    })).rejects.toBeInstanceOf(AppError);
  });
});