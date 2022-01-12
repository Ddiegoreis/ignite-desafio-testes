import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create user", () => {
  const testUSerData: ICreateUserDTO = {
    name: "John Doe",
    email: "john.doe@mail.com",
    password: "password",
  }

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const userCreated = await createUserUseCase.execute(testUSerData);

    expect(userCreated).toHaveProperty("id");
    expect(userCreated).toHaveProperty("password");
    expect(userCreated.name).toEqual(testUSerData.name);
    expect(userCreated.email).toEqual(testUSerData.email);
    expect(userCreated.password).not.toEqual(testUSerData.password);
  });

  it("should not be able to create a new user that already exists", async () => {
    await createUserUseCase.execute(testUSerData);

    expect(async () => {
      await createUserUseCase.execute(testUSerData);
    }).rejects.toBeInstanceOf(AppError);
  });
});
