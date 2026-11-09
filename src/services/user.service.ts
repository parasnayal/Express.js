import { userRepository } from "../repositories/user.repository.ts"
import { AppError } from "../utils/AppError.ts";

export const userService = {
    async getAllUsers() {
        const user = await userRepository.findAll();

        return user;
    },
    async getTasksByUserId(id:number) {
        const user = await userRepository.findById(id);

        if(!user){
            throw new AppError(
                404,
                "USER_NOT_FOUND",
                "User not found"
            )
        }
        const tasks = await userRepository.findTasksByUserId(id);

        return {
           user: {
           id: user.id,
           name: user.name,
           email:user.email
        },
        tasks,
        };
    },
    async getUsersWithTaskCount(id:number){
        const user = await userRepository.findUsersWithTaskCount(id);

        
        if(!user){
            throw new AppError(
                404,
                "USER_NOT_FOUND",
                "User not found"
            )
        }

        return user;
    },
    async createUser(payload:{name:string,email:string}){
        const {name,email} = payload;

        const user = await userRepository.create({name:name.trim(),email});

        console.log(user,'user')

        return user;
    }
}