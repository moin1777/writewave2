import { Hono } from "hono";
import userRoute from "./user";
import blogRoute from "./blog";

const app = new Hono();

app.route("/user", userRoute);
app.route("/blog", blogRoute);

export default app;