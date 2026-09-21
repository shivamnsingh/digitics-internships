import { cookies } from "next/headers";
import { COOKIE, verify } from "./token";
export const isAdmin = async () => verify(cookies().get(COOKIE)?.value);
