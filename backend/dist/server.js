"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./lib/prisma");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
const PORT = 5001;
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.json({
        message: "AETHENIX API is running 🚀",
    });
});
app.get("/api/db-test", async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.count();
        res.json({
            success: true,
            message: "Database connected successfully 🚀",
            userCount: users,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
