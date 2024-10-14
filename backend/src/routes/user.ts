import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@moin17/writewave-common2";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
}>();


async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}
async function verifyPassword(inputPassword: string, storedHash: string) {
  const inputHash = await hashPassword(inputPassword);
  return inputHash === storedHash;
}

app.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if (!success) {
    return c.json({
      err: "Incorrect Inputs type"
    }, 403);
  }
  
  const hash = await hashPassword(body.password);
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hash,
        name: body.name
      }
    });

    const token = await sign({id: user.id}, c.env.JWT_SECRET)
    return c.json({token}, 200);
  } catch(err) {
    c.status(403);
    return c.text("invalid input", 403);
  }
});

app.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);
  if (!success) {
    return c.json({
      err: "Incorrect Inputs type"
    }, 403);
  }

  const user = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  });
  
  if (!user) {
    return c.json({
      err: "Invalid email/User dosen't exist"
    }, 403)
  }
  
  if (!(await verifyPassword(body.password, user.password))) {
    return c.json({
      err: "Invalid password"
    }, 403)
  }

  const token = await sign({id: user.id}, c.env.JWT_SECRET);
  return c.json({token}, 200);
});

export default app;