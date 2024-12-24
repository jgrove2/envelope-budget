import { Z } from "zero-svelte";
import { schema, type Schema } from "./zSchema";
import { env } from "$env/dynamic/public";

export const zConstructor = (userID: string) => {
    if(!userID || typeof userID !== "string") {
        throw Error("Invalid declaration of z")
    }
    return new Z<Schema>({
        server: env.PUBLIC_SERVER,
        schema,
        userID
    })
} 