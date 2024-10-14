import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createPostInput, updatePostInput } from "@moin17/writewave-common2";


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    userId: string;
  }
}>();


app.use("/*", async (c, next) => {

  const headers = c.req.header("authorization");
  const token = headers?.split(" ")[1];
  type JwtPayload = {
    id: string
  }

  if (!token) {
    return c.json({err: "unathorized"}, 401);
  }
  try {
    const { id } = await verify(token, c.env.JWT_SECRET) as JwtPayload;
    if (!id) {
      return c.json({err: "unathorized"}, 401);
    }
    c.set("userId", id);
    await next();
  } catch(err) {
    c.json({
      err: "unathorized"
    }, 401);
  }
});

app.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const userId = c.get("userId");

  const { success } = createPostInput.safeParse(body);
  if (!success) {
    return c.json({err: "Invalid inputs"}, 411);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    return c.json({err: "invlid userId"});
  }

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      author: {
        connect: {
          id: userId
        }
      }
    }
  });

  return c.json({
    msg: "post created successfully"
  });
});

app.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());

  const body = await c.req.json();
  console.log(body);
  const userId = c.get("userId");

  const { success } = updatePostInput.safeParse(body);
  if (!success) {
    return c.json({err: "Invalid inputs"}, 411);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    return c.json({err: "invlid userId"});
  }

  try {
    await prisma.post.update({
      where: {
        id: body.id,
        authorId: userId
      },
      data: {
        title: body.title,
        content: body.content
      }
    });

    return c.json({
      msg: "post updated successfully"
    });
  } catch(err) {
    return c.json({err: "Invalid inputs"}, 403);
  }
});

app.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());

  const userId = c.get("userId");
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    return c.json({err: "invlid userId"});
  }

  const posts = await prisma.post.findMany({});
  return c.json({
    posts
  });
});

app.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());

  const id = c.req.param("id");
  const userId = c.get("userId");

  const post = await prisma.post.findUnique({
    where: {
      id: id,
      authorId: userId
    }
  });

  return c.json({
    post
  });
});

export default app;